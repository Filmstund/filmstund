package cinema

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path"

	"edholm.dev/go-logging"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/filmstund/filmstund/internal/auth0"
	"github.com/filmstund/filmstund/internal/graph"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/gorilla/mux"
)

type Server struct {
	cfg          *Config
	auth0Handler *auth0.Handler
	env          *serverenv.ServerEnv
	sessionStore *session.Storage
}

func NewServer(ctx context.Context, cfg *Config, env *serverenv.ServerEnv) (*Server, error) {
	stat, err := os.Stat(cfg.ServePath)
	if err != nil {
		return nil, err
	}
	if !stat.IsDir() {
		return nil, fmt.Errorf("not a directory: %s", cfg.ServePath)
	}

	sessStore, err := session.NewStorage(cfg, env)
	if err != nil {
		return nil, fmt.Errorf("session.NewStorage: %w", err)
	}

	auth0Handler, err := auth0.NewHandler(ctx, cfg.Auth0Config(), env.Database(), sessStore)
	if err != nil {
		return nil, fmt.Errorf("failed to setup Auth0 handler: %w", err)
	}

	return &Server{
		cfg:          cfg,
		auth0Handler: auth0Handler,
		env:          env,
		sessionStore: sessStore,
	}, nil
}

func (s *Server) Routes(ctx context.Context) *mux.Router {
	logger := logging.FromContext(ctx)

	notAuthed := mux.NewRouter()

	// Middleware
	// TODO: request id?
	notAuthed.Use(middleware.RecoverPanic())
	notAuthed.Use(middleware.AttachAppLogger(logger))
	notAuthed.Use(middleware.ProcessMaintenance(s.cfg))
	notAuthed.Use(middleware.Cors(s.cfg)) // TODO: stricter settings
	// TODO: authentication, security headers?

	authorized := notAuthed.PathPrefix("/").Subrouter()
	authorized.Use(middleware.AuthorizeSession(s.sessionStore))

	// Routing table
	authorized.Handle("/api/graphql", s.graphQLHandler()).
		Methods(http.MethodPost, http.MethodGet, http.MethodOptions)
	authorized.Handle(path.Join(s.cfg.Site.CalendarURLPrefix, "/{feed}"), s.calendarFeedHandler())

	notAuthed.Handle("/login", s.auth0Handler.LoginHandler())
	notAuthed.Handle("/login/callback", s.auth0Handler.LoginCallbackHandler())
	notAuthed.Handle("/logout", s.auth0Handler.LogoutHandler())

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
