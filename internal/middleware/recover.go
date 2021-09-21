package middleware

import (
	"net/http"

	"github.com/filmstund/filmstund/internal/logging"
	"github.com/gorilla/mux"
)

// RecoverPanic listens for panics and recovers them, returning a 500 Internal Server Error when they happen.
// TODO: add tests.
func RecoverPanic() mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			logger := logging.FromContext(r.Context())

			defer func() {
				rec := recover()
				if rec != nil {
					logger.Errorw("panic occurred", "url", r.RequestURI, "panic", rec)
					// TODO: replace with something more convenient
					http.Error(w, `{"error": "an unexpected error occurred"}`, http.StatusInternalServerError)
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}
