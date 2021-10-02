package middleware

import (
	"net/http"

	"edholm.dev/go-logging"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
)

func AttachAppLogger(logger *zap.SugaredLogger) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			// TODO: add request_id header?

			logger := logger
			ctx = logging.WithLogger(ctx, logger)
			r = r.Clone(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
