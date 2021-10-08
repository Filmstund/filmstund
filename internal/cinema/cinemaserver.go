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

	notAuthed := mux.NewRouter()

	// Middleware
	// TODO: request id?
	notAuthed.Use(middleware.RecoverPanic())
	notAuthed.Use(middleware.AttachAppLogger(logger))
	notAuthed.Use(middleware.ProcessMaintenance(s.cfg))
	notAuthed.Use(middleware.Cors(s.cfg)) // TODO: stricter settings
	// TODO: authentication, security headers?

	authorized := notAuthed.PathPrefix("/").Subrouter()
	authorized.Use(middleware.ApplyAuthorization(s.cfg))

	// Routing table
	authorized.Handle("/api/graphql", s.graphQLHandler()).
		Methods(http.MethodPost, http.MethodGet, http.MethodOptions)
	authorized.Handle(path.Join(s.cfg.Site.CalendarURLPrefix, "/{feed}"), s.calendarFeedHandler())

	notAuthed.Handle("/login", s.env.Auth0Service().LoginHandler())
	notAuthed.Handle("/login/callback", s.env.Auth0Service().LoginCallbackHandler())
	notAuthed.Handle("/logout", s.env.Auth0Service().LogoutHandler())

	notAuthed.PathPrefix("/").
		Handler(http.FileServer(http.Dir(s.cfg.ServePath)))

	return notAuthed
}

func (s *Server) graphQLHandler() *handler.Server {
	// GraphQL setup
	gqlConfig := gql.Config{
		Resolvers: graph.NewResolver(s.env, s.cfg),
	}
	return handler.NewDefaultServer(gql.NewExecutableSchema(gqlConfig))
}
