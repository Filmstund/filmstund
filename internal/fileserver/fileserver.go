package fileserver

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/filmstund/filmstund/internal/logging"
)

type Server struct {
	path string
}

func NewServer(filePath string) (*Server, error) {
	if _, err := os.Stat(filePath); err != nil {
		return nil, fmt.Errorf("unable to stat %q: %w", filePath, err)
	}

	// TODO: use config
	return &Server{
		path: filePath,
	}, nil
}

func (s *Server) Routes(ctx context.Context) http.Handler {
	logger := logging.FromContext(ctx)
	logger.Debugf("setting up routes for fileserver: %s", s.path)

	return http.FileServer(http.Dir(s.path))
}
