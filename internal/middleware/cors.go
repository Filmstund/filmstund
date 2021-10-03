package middleware

import (
	"net/http"

	"github.com/filmstund/filmstund/internal/site"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func Cors(provider site.ConfigProvider) mux.MiddlewareFunc {
	cfg := provider.SiteConfig()

	return func(next http.Handler) http.Handler {
		c := cors.New(cors.Options{
			AllowedOrigins:   cfg.AllowedOrigins,
			AllowedHeaders:   []string{"Origin", "Accept", "Content-Type", "X-Requested-With", "Authorization"},
			AllowCredentials: false,
		})
		return http.HandlerFunc(c.HandlerFunc)
	}
}
