package cinema

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/graph"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/idtoken"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/gorilla/mux"
)

// Assertion for making sure the config implements these interfaces.
var (
	_ setup.DatabaseConfigProvider     = (*Config)(nil)
	_ setup.SecurityConfigProvider     = (*Config)(nil)
	_ setup.IDTokenCacheConfigProvider = (*Config)(nil)
)

type Config struct {
	Database     database.Config
	Security     security.Config
	IDTokenCache idtoken.Config

	ListenAddr  string `env:"LISTEN_ADDR,default=:8080"`
	ServePath   string `env:"SERVE_PATH,default=./web/build"`
	Maintenance bool   `env:"MAINTENANCE_MODE, default=false"`
}

func (c *Config) DatabaseConfig() *database.Config {
	return &c.Database
}

func (c *Config) SecurityConfig() *security.Config {
	return &c.Security
}

func (c *Config) IDTokenCacheConfig() idtoken.Config {
	return c.IDTokenCache
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
	// TODO: request id?
	r.Use(middleware.RecoverPanic())
	r.Use(middleware.AttachAppLogger(logger))
	r.Use(middleware.ProcessMaintenance(s.cfg))
	r.Use(middleware.ApplyAuthorization(s.env.IDTokenCache(), s.cfg))
	// TODO: authentication, CORS, security headers?

	// GraphQL setup
	gqlConfig := gql.Config{
		Resolvers: &graph.Resolver{
			DB: s.env.Database(),
		},
	}
	gqlHandler := handler.NewDefaultServer(gql.NewExecutableSchema(gqlConfig))

	// Routing table
	r.Handle("/query", gqlHandler).Methods(http.MethodPost, http.MethodGet, http.MethodOptions)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(s.cfg.ServePath)))

	return r
}
