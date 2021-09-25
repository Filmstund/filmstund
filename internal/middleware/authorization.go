package middleware

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/idtoken"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

type jwtVerifier struct {
	cache *idtoken.Cache
	cfg   *security.Config
	w     http.ResponseWriter
	r     *http.Request
}

// ApplyAuthorization validates the JWT token in the "Authorization" header.
// If valid, it fetches the id_token and affixes the tokens to the request context.
// TODO: document and test.
func ApplyAuthorization(idTokenCache *idtoken.Cache, confProvider setup.SecurityConfigProvider) mux.MiddlewareFunc {
	cfg := confProvider.SecurityConfig()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			verifier := jwtVerifier{
				cache: idTokenCache,
				cfg:   cfg,
				w:     w,
				r:     r,
			}

			if token := verifier.authorization(); token != nil {
				if idToken := verifier.fetchIDToken(token); idToken != nil {
					ctx := security.WithToken(r.Context(), token)
					ctx = idtoken.WithIDToken(ctx, idToken)

					next.ServeHTTP(w, r.Clone(ctx))
				}
			}
		})
	}
}

func (v *jwtVerifier) authorization() *jwt.Token {
	logger := logging.FromContext(v.r.Context()).
		With("url", v.r.URL.String()).
		With("from", v.r.RemoteAddr)

	rawToken, exists := httputils.ExtractTokenFromHeader(v.r)
	if !exists {
		logger.Debugf("[token] missing authorization header")
		httputils.Unauthorized(v.w, v.r)
		return nil
	}

	// Fetch the jwks (this might hang indefinitely...)
	jwks := v.cfg.JWKs(v.r.Context())

	// Parse and validate the token
	token, err := jwt.Parse(rawToken, jwks.Keyfunc)
	if err != nil {
		logger.Debugw("[token] broken/invalid token supplied", "err", err, "claims", token.Claims)
		httputils.Unauthorized(v.w, v.r)
		return nil
	}

	// Verify token is signed with expected algorithm
	// https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/
	if token.Header["alg"] != v.cfg.Algorithm {
		logger.Debugw("[token] signed with wrong alg", "alg", token.Header["alg"])
		httputils.Unauthorized(v.w, v.r)
		return nil
	}

	// Verify token has the expected issuer and audience claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if !claims.VerifyAudience(v.cfg.Audience, true) ||
			!claims.VerifyIssuer(v.cfg.Issuer, true) ||
			!claims.VerifyExpiresAt(time.Now().Unix(), true) { // verify that this claim actually exists
			logger.Debugw(
				"[token] couldn't verify audience/issuer",
				"audience", claims["aud"],
				"issuer", claims["iss"],
			)
			httputils.Unauthorized(v.w, v.r)
			return nil
		}
	} else {
		logger.Warnw(
			"[token] invalid claim type and/or invalid token")
		httputils.Unauthorized(v.w, v.r)
		return nil
	}

	return token
}

func (v *jwtVerifier) fetchIDToken(token *jwt.Token) *idtoken.IDToken {
	logger := logging.FromContext(v.r.Context()).
		With("url", v.r.URL.String()).
		With("from", v.r.RemoteAddr)

	if token == nil {
		logger.Errorf("no token supplied. Missing authorization?")
		httputils.InternalServerError(v.w, v.r)
		return nil
	}

	// return early if we have the current subject in cache.
	// TODO: make this more safe...
	sub := idtoken.Subject(token.Claims.(jwt.MapClaims)["sub"].(string))
	if idToken := v.cache.Get(sub); idToken != nil {
		logger.Debugf("token fetched from cache for %s: %v", sub, idToken)
		return idToken
	}

	userinfoReq, err := http.NewRequestWithContext(v.r.Context(), http.MethodGet, v.cfg.UserinfoURL, nil)
	if err != nil {
		logger.Infow("failed to construct request to /userinfo", "err", err, "url", v.cfg.UserinfoURL)
		httputils.InternalServerError(v.w, v.r)
		return nil
	}
	userinfoReq.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token.Raw))

	userinfoResp, err := http.DefaultClient.Do(userinfoReq)
	if err != nil {
		logger.Infow("failure fetching /userinfo", "err", err, "url", v.cfg.UserinfoURL)
		httputils.InternalServerError(v.w, v.r)
		return nil
	}
	defer userinfoResp.Body.Close()

	if userinfoResp.StatusCode != http.StatusOK {
		logger.Infow("non-200 status code when fetching /userinfo", "code", userinfoResp.Status)
		if userinfoResp.StatusCode == http.StatusUnauthorized {
			httputils.Unauthorized(v.w, v.r)
		} else {
			httputils.InternalServerError(v.w, v.r)
		}
		return nil
	}

	buf, err := io.ReadAll(userinfoResp.Body)
	if err != nil {
		logger.Infow("failed to read response body", "err", err)
		httputils.InternalServerError(v.w, v.r)
		return nil
	}

	var idToken idtoken.IDToken
	if err := json.Unmarshal(buf, &idToken); err != nil {
		logger.Infow("failed to unmarshal ID token", "err", err)
		httputils.Unauthorized(v.w, v.r)
		return nil
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		// TODO: make this safer
		exp := time.Unix(int64(claims["exp"].(float64)), 0)
		logger.Debugf("caching %q until %s", idToken.Sub, exp)
		v.cache.PutOrUpdate(&idToken, exp)
	}
	return &idToken
}
