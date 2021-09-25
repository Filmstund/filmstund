package server

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/filmstund/filmstund/internal/logging"
)

const shutdownTimeout = 10 * time.Second

type Server struct {
	ip       string
	port     int
	listener net.Listener
}

func New(addr string) (*Server, error) {
	listen, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, fmt.Errorf("failed to listen on %s: %w", addr, err)
	}

	tcpAddr := listen.Addr().(*net.TCPAddr) //nolint:forcetypeassert
	return &Server{
		ip:       tcpAddr.IP.String(),
		port:     tcpAddr.Port,
		listener: listen,
	}, nil
}

// ServeHTTP listens and serves requests using the provided server.
func (s *Server) ServeHTTP(ctx context.Context, srv *http.Server) error {
	logger := logging.FromContext(ctx)

	errCh := make(chan error, 1)
	go func() {
		<-ctx.Done()

		logger.Debugf("http.Server: context closed")
		timeCtx, cancelFunc := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancelFunc()

		logger.Debugf("http.Server: shutting down")
		errCh <- srv.Shutdown(timeCtx)
	}()

	logger.Infof("listening for HTTP on %s", s.Addr())
	if err := srv.Serve(s.listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("failed to serve HTTP: %w", err)
	}

	logger.Debugf("stopped listening for HTTP")
	select {
	case err := <-errCh:
		return fmt.Errorf("failed to shutdown server: %w", err)
	default:
		return nil
	}
}

// ServeHTTPHandler is a convenience wrapper for ServeHTTP.
func (s *Server) ServeHTTPHandler(ctx context.Context, handler http.Handler) error {
	return s.ServeHTTP(ctx, &http.Server{
		Handler: handler,
		// ReadTimeout:  0, // TODO: configure
		// WriteTimeout: 0, // TODO: configure
		// IdleTimeout:  0, // TODO: configure
	})
}

// Addr returns the listening address for this server (ip:port).
func (s *Server) Addr() string {
	return net.JoinHostPort(s.ip, strconv.Itoa(s.port))
}
