package serverenv

import (
	"context"

	"github.com/filmstund/filmstund/internal/auth0"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/filmstund/filmstund/internal/user"
)

type ServerEnv struct {
	db             *database.DB
	auth0Service   *auth0.Service
	userService    *user.Service
	sessionStorage *session.Storage
}

type Option func(*ServerEnv) *ServerEnv

func New(ctx context.Context, opts ...Option) *ServerEnv {
	env := &ServerEnv{}

	for _, f := range opts {
		env = f(env)
	}

	return env
}

func WithDatabase(db *database.DB) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.db = db
		return env
	}
}

func (e *ServerEnv) Database() *database.DB {
	return e.db
}

func WithAuth0Service(auth0Service *auth0.Service) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.auth0Service = auth0Service
		return env
	}
}

func (e *ServerEnv) Auth0Service() *auth0.Service {
	return e.auth0Service
}

func WithUserService(us *user.Service) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.userService = us
		return env
	}
}

func (e *ServerEnv) UserService() *user.Service {
	return e.userService
}

func WithSessionStorage(sessionStorage *session.Storage) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.sessionStorage = sessionStorage
		return env
	}
}

func (e *ServerEnv) SessionStorage() *session.Storage {
	return e.sessionStorage
}

func (e *ServerEnv) Close(ctx context.Context) error {
	if e == nil {
		return nil
	}

	if e.db != nil {
		e.db.Close(ctx)
	}

	return nil
}
