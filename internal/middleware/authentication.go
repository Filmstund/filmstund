package middleware

import (
	"net/http"

	"github.com/gorilla/mux"
)

func ApplyAuthentication() mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			// TODO: fetch user id token from /userinfo
			// unless given by frontend?
			next.ServeHTTP(writer, request)
		})
	}
}
