package middleware

import (
	"net/http"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/gorilla/mux"
)

func AuthorizeSession(sessionClient *session.Client) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			logger := logging.FromContext(r.Context()).
				WithValues("url", r.URL.String(), "from", r.RemoteAddr)

			prin, sessionID, err := sessionClient.Lookup(r.Context(), r)
			if err != nil {
				logger.V(1).Info("failed to validate session", "err", err)
				httputils.Unauthorized(w, r)
				return
			}

			ctx := session.WithSessionID(r.Context(), sessionID)
			ctx = principal.WithPrincipal(ctx, prin)
			next.ServeHTTP(w, r.Clone(ctx))
		})
	}
}
