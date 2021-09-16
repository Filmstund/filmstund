package server

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/filmstund/filmstund/internal/logging"
)

const shutdownTimeout = 10 * time.Second

type Server struct {
	addr    string
	webPath string
}

func (r *Server) ServeHTTP(ctx context.Context) error {
	logger := logging.FromContext(ctx)

	// Routing table TODO: if we get many routes, change to e.g. mux
	http.Handle("/", http.FileServer(http.Dir(r.webPath)))

	srv := http.Server{
		Addr: r.addr,
	}

	go func() {
		<-ctx.Done()
		timeCtx, cancelFunc := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancelFunc()
		logger.Info("shutting down the HTTP server")
		if err := srv.Shutdown(timeCtx); err != nil && !errors.Is(err, context.Canceled) {
			logger.Warnw("non-graceful http server shutdown", "error", err)
		}
	}()

	logger.Infof("listening for HTTP on %s", srv.Addr)
	err := srv.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}
	return err
}

func New(addr, webPath string) *Server {
	return &Server{
		addr:    addr,
		webPath: webPath,
	}
}
