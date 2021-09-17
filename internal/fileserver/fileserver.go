package fileserver

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/gorilla/mux"
)

type Config struct {
	ListenAddr  string `env:"LISTEN_ADDR,default=:8080"`
	ServePath   string `env:"SERVE_PATH,default=./web/build"`
	Maintenance bool   `env:"MAINTENANCE_MODE, default=false"`
}

func (c *Config) MaintenanceMode() bool {
	return c.Maintenance
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

func (s *Server) Routes(ctx context.Context) *mux.Router {
	logger := logging.FromContext(ctx)
	logger.Debugf("routing / to file://%s", s.cfg.ServePath)

	r := mux.NewRouter()

	// Middleware
	r.Use(middleware.ProcessMaintenance(s.cfg))

	// Routing table
	r.Handle("/", http.FileServer(http.Dir(s.cfg.ServePath)))

	return r
}
