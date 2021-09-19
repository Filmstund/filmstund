package middleware

import (
	"net/http"

	"github.com/filmstund/filmstund/internal/logging"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
)

func AttachAppLogger(logger *zap.SugaredLogger) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			// TODO: add request_id header?

			ctx = logging.WithLogger(ctx, logger)
			r = r.Clone(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
