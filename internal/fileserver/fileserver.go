package fileserver

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/gorilla/mux"
)

// Assertion for making sure the config implements these interfaces.
var _ setup.DatabaseConfigProvider = (*Config)(nil)

type Config struct {
	Database database.Config

	ListenAddr  string `env:"LISTEN_ADDR,default=:8080"`
	ServePath   string `env:"SERVE_PATH,default=./web/build"`
	Maintenance bool   `env:"MAINTENANCE_MODE, default=false"`
}

func (c *Config) DatabaseConfig() *database.Config {
	return &c.Database
}

func (c *Config) MaintenanceMode() bool {
	return c.Maintenance
}

type Server struct {
	cfg *Config
	env *serverenv.ServerEnv
}

func NewServer(cfg *Config, env *serverenv.ServerEnv) (*Server, error) {
	stat, err := os.Stat(cfg.ServePath)
	if err != nil {
		return nil, err
	}
	if !stat.IsDir() {
		return nil, fmt.Errorf("not a directory: %s", cfg.ServePath)
	}

	return &Server{
		cfg: cfg,
		env: env,
	}, nil
}

func (s *Server) Routes(ctx context.Context) *mux.Router {
	logger := logging.FromContext(ctx)
	logger.Debugf("routing / to file://%s", s.cfg.ServePath)

	r := mux.NewRouter()

	// Middleware
	r.Use(middleware.ProcessMaintenance(s.cfg))

	r.HandleFunc("/poc/biobudord", func(w http.ResponseWriter, r *http.Request) {
		// TODO: convenience method for getting a "queries"
		conn, err := s.env.Database().Pool.Acquire(ctx)
		if err != nil {
			logger.Warnw("Couldn't acquire DB con", "err", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer conn.Release()

		queries := sqlc.New(conn)
		budord, err := queries.ListBioBudord(ctx)
		if err != nil {
			logger.Warnw("unable to list biobudord", "err", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		marshal, err := json.Marshal(budord)
		if err != nil {
			logger.Warnw("failed to marshal biobudord", "budord", budord)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if _, err := w.Write(marshal); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			logger.Warnw("failed to write payload", "err", err)
		}
	})

	// Routing table
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(s.cfg.ServePath)))

	return r
}
