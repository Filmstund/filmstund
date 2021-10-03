package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/security/principal"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
)

type jwtVerifier struct {
	cache  *principal.Cache
	cfg    *security.Config
	logger *zap.SugaredLogger
}

// ApplyAuthorization validates the JWT token in the "Authorization" header.
// If valid, it fetches the id_token and affixes the tokens to the request context.
// TODO: document and test.
func ApplyAuthorization(principalCache *principal.Cache, confProvider setup.SecurityConfigProvider) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			verifier := jwtVerifier{
				cache: principalCache,
				cfg:   confProvider.SecurityConfig(),
				logger: logging.FromContext(r.Context()).
					With("url", r.URL.String()).
					With("from", r.RemoteAddr),
			}

			token, err := verifier.doAuthorization(r)
			if err != nil {
				httputils.RespondBasedOnErr(err, w, r)
				return
			}

			p, err := verifier.getPrincipal(r.Context(), token)
			if err != nil {
				httputils.RespondBasedOnErr(err, w, r)
				return
			}

			ctx := principal.WithPrincipal(r.Context(), p)
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
	token, err := jwt.ParseWithClaims(rawToken, &security.Auth0Claims{}, jwks.Keyfunc)
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
	claims, castOK := token.Claims.(*security.Auth0Claims)
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

// getPrincipal fetches the principal from cache _or_ downloads the ID token
// from the userinfo endpoint and parses the principal. If everything checks out
// you will have valid principal that is put into the cache, else an error.
func (v *jwtVerifier) getPrincipal(ctx context.Context, token *jwt.Token) (*principal.Principal, error) {
	if token == nil || !token.Valid {
		v.logger.Errorf("no/invalid token supplied. Missing doAuthorization?")
		return nil, httputils.ErrInternal
	}

	// we panic here if it is the wrong type - should've been checked earlier
	claims := token.Claims.(*security.Auth0Claims) //nolint:forcetypeassert

	// return early if we have the current subject in cache.
	if p := v.cache.Get(claims.Subject); p != nil {
		// TODO: remove log line
		v.logger.Debugf("principal fetched from cache for %s: %v", claims.Subject, p)
		return p, nil
	}

	userinfoReq, err := http.NewRequestWithContext(ctx, http.MethodGet, v.cfg.UserinfoURL, nil)
	if err != nil {
		v.logger.Infow("failed to construct request to /userinfo", "err", err, "url", v.cfg.UserinfoURL)
		return nil, httputils.ErrInternal
	}
	userinfoReq.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token.Raw))

	resp, err := http.DefaultClient.Do(userinfoReq)
	if err != nil {
		v.logger.Infow("GET /userinfo failed", "err", err, "url", v.cfg.UserinfoURL)
		return nil, httputils.ErrInternal
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		v.logger.Infow("non-200 status code when fetching /userinfo", "code", resp.Status)
		if resp.StatusCode == http.StatusUnauthorized {
			return nil, httputils.ErrUnauthorized
		}
		return nil, httputils.ErrInternal
	}

	buf, err := io.ReadAll(resp.Body)
	if err != nil {
		v.logger.Infow("failed to read response body", "err", err)
		return nil, httputils.ErrInternal
	}

	var idToken idToken
	if err := json.Unmarshal(buf, &idToken); err != nil {
		v.logger.Infow("failed to unmarshal ID token", "err", err)
		return nil, httputils.ErrInternal
	}

	p := idToken.toPrincipal(claims)
	exp := claims.ExpiresAt.Time
	v.logger.Debugf("caching %q until %s", p.Sub, exp)
	v.cache.PutOrUpdate(&p)
	return &p, nil
}

// idToken as returned by the /userinfo endpoint.
type idToken struct {
	Sub           string    `json:"sub"`
	GivenName     string    `json:"given_name"`
	FamilyName    string    `json:"family_name"`
	Nickname      string    `json:"nickname"`
	Name          string    `json:"name"`
	Picture       string    `json:"picture"`
	Locale        string    `json:"locale"`
	UpdatedAt     time.Time `json:"updated_at"`
	Email         string    `json:"email"`
	EmailVerified bool      `json:"email_verified"`
}

// toPrincipal converts an ID token together with our claims to the principal.
func (t *idToken) toPrincipal(claims *security.Auth0Claims) principal.Principal {
	return principal.Principal{
		Sub:        principal.Subject(t.Sub),
		GivenName:  t.GivenName,
		FamilyName: t.FamilyName,
		Nickname:   t.Nickname,
		Picture:    t.Picture,
		Email:      t.Email,
		Scopes:     strings.Split(claims.Scope, " "),
		UpdatedAt:  t.UpdatedAt,
		ExpiresAt:  claims.ExpiresAt.Time,
	}
}
