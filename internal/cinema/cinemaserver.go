package cinema

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path"

	"edholm.dev/go-logging"
	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/filmstund/filmstund/internal/auth0"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/middleware"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/google/uuid"
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
	gqlConfig.Directives.Auth = checkAuth

	server := handler.NewDefaultServer(gql.NewExecutableSchema(gqlConfig))

	// handle panics in resolvers
	server.SetRecoverFunc(func(ctx context.Context, err interface{}) (userMessage error) {
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
	server.AroundResponses(func(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
		// TODO: would it make more sense to have this in a HTTP middleware instead?
		queries, cleanup, err := s.env.Database().Queries(ctx)
		if err != nil {
			logging.FromContext(ctx).Error(err, "failed to get DB queries")
			return graphql.ErrorResponse(ctx, "internal server error")
		}
		defer cleanup()
		return next(database.WithContext(ctx, queries))
	})
	return server
}

func checkAuth(ctx context.Context, obj interface{}, next graphql.Resolver, role model.Role) (res interface{}, err error) {
	if role != model.RoleShowingAdmin {
		return next(ctx)
	}

	fieldCtx := graphql.GetFieldContext(ctx)
	if showingID, ok := fieldCtx.Args["showingID"]; ok {
		showingID, ok := showingID.(uuid.UUID)
		if !ok {
			return nil, fmt.Errorf("unexpected showing ID type")
		}

		q := database.FromContext(ctx)
		p := principal.FromContext(ctx)
		if ok, err := q.AdminOnShowing(ctx, dao.AdminOnShowingParams{
			AdminUserID: p.ID,
			ShowingID:   showingID,
		}); ok && err == nil {
			return next(ctx)
		}
	}
	return nil, fmt.Errorf("you must be a showing admin for this")
}
