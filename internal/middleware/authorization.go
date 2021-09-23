package middleware

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/filmstund/filmstund/internal/users"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

// ApplyAuthorization validates the JWT token in the "Authorization" header.
// If valid, it fetches the id_token and affixes the tokens to the request context.
// TODO: document and test.
func ApplyAuthorization(confProvider setup.SecurityConfigProvider) mux.MiddlewareFunc {
	cfg := confProvider.SecurityConfig()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if token := verifyAuthorization(w, r, cfg); token != nil {
				if idToken := fetchIDToken(token, w, r, cfg); idToken != nil {
					ctx := security.WithToken(r.Context(), token)
					ctx = users.WithIDToken(ctx, idToken)

					next.ServeHTTP(w, r.Clone(ctx))
				}
			}
		})
	}
}

func verifyAuthorization(w http.ResponseWriter, r *http.Request, cfg *security.Config) *jwt.Token {
	logger := logging.FromContext(r.Context()).
		With("url", r.URL.String()).
		With("from", r.RemoteAddr)

	rawToken, exists := httputils.ExtractTokenFromHeader(r)
	if !exists {
		logger.Debugf("[token] missing authorization header")
		httputils.Unauthorized(w, r)
		return nil
	}

	// Fetch the jwks (this might hang indefinitely...)
	jwks := cfg.JWKs(r.Context())

	// Parse and validate the token
	token, err := jwt.Parse(rawToken, jwks.Keyfunc)
	if err != nil {
		logger.Debugw("[token] broken/invalid token supplied", "err", err, "claims", token.Claims)
		httputils.Unauthorized(w, r)
		return nil
	}

	// Verify token is signed with expected algorithm
	// https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/
	if token.Header["alg"] != cfg.Algorithm {
		logger.Debugw("[token] signed with wrong alg", "alg", token.Header["alg"])
		httputils.Unauthorized(w, r)
		return nil
	}

	// Verify token has the expected issuer and audience claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if !claims.VerifyAudience(cfg.Audience, true) ||
			!claims.VerifyIssuer(cfg.Issuer, true) ||
			!claims.VerifyExpiresAt(time.Now().Unix(), true) { // verify that this claim actually exists
			logger.Debugw(
				"[token] couldn't verify audience/issuer",
				"audience", claims["aud"],
				"issuer", claims["iss"],
			)
			httputils.Unauthorized(w, r)
			return nil
		}
	} else {
		logger.Warnw(
			"[token] invalid claim type and/or invalid token")
		httputils.Unauthorized(w, r)
		return nil
	}

	return token
}

func fetchIDToken(token *jwt.Token, w http.ResponseWriter, r *http.Request, cfg *security.Config) *users.IDToken {
	logger := logging.FromContext(r.Context()).
		With("url", r.URL.String()).
		With("from", r.RemoteAddr)

	if token == nil {
		logger.Errorf("no token supplied. Missing authorization?")
		httputils.InternalServerError(w, r)
		return nil
	}

	// TODO: fetch id-token from cache.

	userinfoReq, err := http.NewRequestWithContext(r.Context(), http.MethodGet, cfg.UserinfoURL, nil)
	if err != nil {
		logger.Infow("failed to construct request to /userinfo", "err", err, "url", cfg.UserinfoURL)
		httputils.InternalServerError(w, r)
		return nil
	}
	userinfoReq.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token.Raw))

	userinfoResp, err := http.DefaultClient.Do(userinfoReq)
	if err != nil {
		logger.Infow("failure fetching /userinfo", "err", err, "url", cfg.UserinfoURL)
		httputils.InternalServerError(w, r)
		return nil
	}
	defer userinfoResp.Body.Close()

	if userinfoResp.StatusCode != http.StatusOK {
		logger.Infow("non-200 status code when fetching /userinfo", "code", userinfoResp.Status)
		if userinfoResp.StatusCode == http.StatusUnauthorized {
			httputils.Unauthorized(w, r)
		} else {
			httputils.InternalServerError(w, r)
		}
		return nil
	}

	buf, err := io.ReadAll(userinfoResp.Body)
	if err != nil {
		logger.Infow("failed to read response body", "err", err)
		httputils.InternalServerError(w, r)
		return nil
	}

	var idToken users.IDToken
	if err := json.Unmarshal(buf, &idToken); err != nil {
		logger.Infow("failed to unmarshal ID token", "err", err)
		httputils.Unauthorized(w, r)
		return nil
	}

	// TODO: put in cache
	logger.Debugf("authorized user: %s (%s)", idToken.Name, idToken.Email) // TODO: remove once it has served its purpose
	return &idToken
}
