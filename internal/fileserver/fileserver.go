package fileserver

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/filmstund/filmstund/internal/logging"
)

type Config struct {
	ListenAddr string `env:"LISTEN_ADDR,default=:8080"`
	ServePath  string `env:"SERVE_PATH,default=./web/build"`
}

type Server struct {
	cfg *Config
}

func NewServer(cfg *Config) (*Server, error) {
	stat, err := os.Stat(cfg.ServePath)
	if err != nil {
		return nil, err
	}
	if !stat.IsDir() {
		return nil, fmt.Errorf("not a directory: %s", cfg.ServePath)
	}

	return &Server{
		cfg: cfg,
	}, nil
}

func (s *Server) Routes(ctx context.Context) http.Handler {
	logger := logging.FromContext(ctx)
	logger.Debugf("routing / to file://%s", s.cfg.ServePath)

	return http.FileServer(http.Dir(s.cfg.ServePath))
}
