package middleware

import (
	"net/http"
	"strings"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
)

type jwtVerifier struct {
	cfg    *auth0.Config
	logger *zap.SugaredLogger
}

// ApplyAuthorization validates the JWT token in the "Authorization" header.
// If valid, it fetches the id_token and affixes the tokens to the request context.
// TODO: document and test.
func ApplyAuthorization(cfg *auth0.Config) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			verifier := jwtVerifier{
				cfg: cfg,
				logger: logging.FromContext(r.Context()).
					With("url", r.URL.String()).
					With("from", r.RemoteAddr),
			}

			token, err := verifier.doAuthorization(r)
			if err != nil {
				httputils.RespondBasedOnErr(err, w, r)
				return
			}

			princ, err := verifier.extractPrincipal(token)
			if err != nil {
				httputils.RespondBasedOnErr(err, w, r)
				return
			}

			// TODO: check if we have an id token from the frontend to include.
			ctx := principal.WithPrincipal(r.Context(), princ)
			next.ServeHTTP(w, r.Clone(ctx))
		})
	}
}

// doAuthorization extracts the JWT token from the Authorization header and
// parses it, checks the signature, and the included claims for validity.
// If everything checks out, then a valid, parsed token is returned, else an error.
func (v *jwtVerifier) doAuthorization(r *http.Request) (*jwt.Token, error) {
	rawToken, exists := httputils.ExtractTokenFromHeader(r)
	if !exists {
		v.logger.Debugf("[token] missing authorization header")
		return nil, httputils.ErrUnauthorized
	}

	// Get the JWKS (this might hang indefinitely...)
	jwks := v.cfg.JWKs(r.Context())

	// Parse and validate the token
	token, err := jwt.ParseWithClaims(rawToken, &auth0.Claims{}, jwks.Keyfunc)
	if err != nil {
		v.logger.Debugw("[token] invalid token", "err", err)
		return nil, httputils.ErrUnauthorized
	}

	// Verify token is signed with expected algorithm
	// https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/
	if token.Header["alg"] != v.cfg.Algorithm {
		v.logger.Debugw("[token] signed with wrong alg", "alg", token.Header["alg"])
		return nil, httputils.ErrUnauthorized
	}

	// Verify token has the expected issuer, audience, expires at claims
	claims, castOK := token.Claims.(*auth0.Claims)
	if !castOK {
		v.logger.Errorf("failed to cast claims, got type %T", token.Claims)
		return nil, httputils.ErrInternal
	}

	if !claims.VerifyAudience(v.cfg.Audience, true) {
		v.logger.Debugw("[token] couldn't verify audience", "audience", claims.Audience, "expected", v.cfg.Audience)
		return nil, httputils.ErrUnauthorized
	}

	if !claims.VerifyIssuer(v.cfg.Issuer) {
		v.logger.Debugw("[token] couldn't verify issuer", "issuer", claims.Issuer, "expected", v.cfg.Issuer)
		return nil, httputils.ErrUnauthorized
	}

	// verify that this claim actually exists TODO: use timefunc instead of time.Now()
	if !claims.VerifyExpiresAt(time.Now(), true) {
		v.logger.Debugw("[token] token has expired or doesn't have expire at claim", "expiresAt", claims.ExpiresAt)
		return nil, httputils.ErrUnauthorized
	}

	return token, nil
}

// extractPrincipal fetches the principal from cache _or_ downloads the ID token
// from the userinfo endpoint and parses the principal. If everything checks out
// you will have valid principal that is put into the cache, else an error.
func (v *jwtVerifier) extractPrincipal(token *jwt.Token) (*principal.Principal, error) {
	if token == nil || !token.Valid {
		v.logger.Errorf("no/invalid token supplied. Missing authorization?")
		return nil, httputils.ErrInternal
	}

	// we panic here if it is the wrong type - should've been checked earlier
	claims := token.Claims.(*auth0.Claims) //nolint:forcetypeassert

	return &principal.Principal{
		Subject:   claims.Subject,
		Scopes:    strings.Split(claims.Scope, " "),
		ExpiresAt: claims.ExpiresAt.Time,
		Token:     token,
	}, nil
}
