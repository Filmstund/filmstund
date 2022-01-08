package cinema

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path"
	"time"

	"edholm.dev/go-logging"
	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/filmstund/filmstund/internal/auth0"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/graph"
	"github.com/filmstund/filmstund/internal/graph/dataloader"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/gorilla/mux"
)

type Server struct {
	cfg           *Config
	auth0Handler  *auth0.Handler
	env           *serverenv.ServerEnv
	sessionClient *session.Client
}

func NewServer(ctx context.Context, cfg *Config, env *serverenv.ServerEnv) (*Server, error) {
	stat, err := os.Stat(cfg.ServePath)
	if err != nil {
		return nil, err
	}
	if !stat.IsDir() {
		return nil, fmt.Errorf("not a directory: %s", cfg.ServePath)
	}

	sessClient, err := session.NewClient(cfg, env)
	if err != nil {
		return nil, fmt.Errorf("session.NewClient: %w", err)
	}

	auth0Handler, err := auth0.NewHandler(ctx, cfg.Auth0Config(), env, sessClient)
	if err != nil {
		return nil, fmt.Errorf("failed to setup Auth0 handler: %w", err)
	}

	return &Server{
		cfg:           cfg,
		auth0Handler:  auth0Handler,
		env:           env,
		sessionClient: sessClient,
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
	authorized.Use(middleware.AuthorizeSession(s.sessionClient))

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
	// This func checks that operations that have the "auth" directive is asserted.
	gqlConfig.Directives.Auth = graph.VerifyShowingAdmin

	gqlSrv := handler.NewDefaultServer(gql.NewExecutableSchema(gqlConfig))

	// handle panics in resolvers
	gqlSrv.SetRecoverFunc(func(ctx context.Context, err interface{}) (userMessage error) {
		if e, ok := err.(error); ok {
			logging.FromContext(ctx).
				WithCallDepth(4).
				Error(e, "graphQL resolver issued panic")
		} else {
			logging.FromContext(ctx).
				WithCallDepth(4).
				Error(nil, "graphQL resolver issued panic", "error", err)
		}
		return fmt.Errorf("internal server error")
	})

	// inject the db query into the request context
	gqlSrv.AroundResponses(func(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
		// TODO: would it make more sense to have this in a HTTP middleware instead?
		queries := s.env.Database().Queries(ctx)
		dbCtx := database.WithContext(ctx, queries)

		loaders := dataloader.NewLoaders(dbCtx)
		dlc := dataloader.WithContext(dbCtx, loaders)
		return next(dlc)
	})

	// logging middleware
	gqlSrv.AroundFields(func(ctx context.Context, next graphql.Resolver) (res interface{}, err error) {
		logger := logging.FromContext(ctx).V(6)
		fc := graphql.GetFieldContext(ctx)
		if !fc.IsResolver || !logger.Enabled() {
			return next(ctx)
		}

		before := time.Now()
		i, err := next(ctx)
		dur := time.Since(before)

		var (
			queryName = fc.Field.Name
			args      = fc.Args
		)
		logger.Info("qgl resolver called",
			"name", queryName,
			"arguments", args,
			"duration", dur.String(),
		)
		return i, err
	})
	gqlSrv.AroundOperations(func(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
		logger := logging.FromContext(ctx).V(5)
		if !logger.Enabled() {
			return next(ctx)
		}

		oc := graphql.GetOperationContext(ctx)
		logger.Info("received gql query/mutation",
			"operation", oc.OperationName,
		)
		return next(ctx)
	})

	return gqlSrv
}
