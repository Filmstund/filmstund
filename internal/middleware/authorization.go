package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

// TODO: document and test.
func ApplyAuthorization(confProvider setup.SecurityConfigProvider) mux.MiddlewareFunc {
	cfg := confProvider.SecurityConfig()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			logger := logging.FromContext(r.Context()).
				With("url", r.URL.String()).
				With("from", r.RemoteAddr)

			rawToken, exists := extractTokenFromHeader(r)
			if !exists {
				logger.Debugf("[token] missing authorization header")
				writeStatusUnauthorized(w, r)
				return
			}

			// Fetch the jwks (this might hang indefinitely...)
			jwks := cfg.JWKs(r.Context())

			// Parse and validate the token
			token, err := jwt.Parse(rawToken, jwks.Keyfunc)
			if err != nil {
				logger.Debugw("[token] broken/invalid token supplied", "err", err, "claims", token.Claims)
				writeStatusUnauthorized(w, r)
				return
			}

			// TODO(Erica): verify exp

			// Verify token is signed with expected algorithm
			// https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/
			if token.Header["alg"] != cfg.Algorithm {
				logger.Debugw("[token] signed with wrong alg", "alg", token.Header["alg"])
				writeStatusUnauthorized(w, r)
				return
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
					writeStatusUnauthorized(w, r)
					return
				}
			} else {
				logger.Warnw(
					"[token] invalid claim type and/or invalid token")
				writeStatusUnauthorized(w, r)
				return
			}

			// TODO: store token in context for later authentication
			next.ServeHTTP(w, r)
		})
	}
}

func writeStatusUnauthorized(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusUnauthorized)
	_, err := w.Write([]byte(`{"error": "unauthorized"}`))
	if err != nil {
		logging.FromContext(r.Context()).Warnw("failed to write response", "err", err)
	}
}

// TODO test.
func extractTokenFromHeader(r *http.Request) (string, bool) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", false
	}

	return strings.TrimPrefix(authHeader, "Bearer "), true
}
