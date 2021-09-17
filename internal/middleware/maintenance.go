package middleware

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// Maintainable makes sure that a configuration contains the right config item.
type Maintainable interface {
	MaintenanceMode() bool
}

func ProcessMaintenance(maint Maintainable) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if maint.MaintenanceMode() {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusServiceUnavailable)
				fmt.Fprintf(w, `{"error": "server is down for maintenance mode"}`)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
