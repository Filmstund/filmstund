package cinema

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func (s *Server) calendarFeedHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotImplemented)
		_, _ = w.Write([]byte(fmt.Sprintf(`"not implemented for %s"`, mux.Vars(r)["feed"])))
	})
}
