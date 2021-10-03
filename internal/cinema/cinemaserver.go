package cinema

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path"

	"edholm.dev/go-logging"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/filmstund/filmstund/internal/graph"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/gorilla/mux"
)

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
	// TODO: authentication, CORS, security headers?

	authorized := r.PathPrefix("/").Subrouter()
	authorized.Use(middleware.ApplyAuthorization(s.env.PrincipalCache(), s.cfg))

	// Routing table
	authorized.Handle("/api/graphql", s.graphQLHandler()).
		Methods(http.MethodPost, http.MethodGet, http.MethodOptions)
	authorized.Handle(path.Join(s.cfg.Site.CalendarURLPrefix, "/{feed}"), s.calendarFeedHandler())

	r.PathPrefix("/").
		Handler(http.FileServer(http.Dir(s.cfg.ServePath)))

	return r
}

func (s *Server) graphQLHandler() *handler.Server {
	// GraphQL setup
	gqlConfig := gql.Config{
		Resolvers: graph.NewResolver(s.env.Database(), s.cfg),
	}
	return handler.NewDefaultServer(gql.NewExecutableSchema(gqlConfig))
}
