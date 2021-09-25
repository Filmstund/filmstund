package serverenv

import (
	"context"

	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/idtoken"
)

type ServerEnv struct {
	db           *database.DB
	idTokenCache *idtoken.Cache
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

func WithIDTokenCache(cache *idtoken.Cache) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.idTokenCache = cache
		return env
	}
}

func (e *ServerEnv) IDTokenCache() *idtoken.Cache {
	return e.idTokenCache
}

func (e *ServerEnv) Close(ctx context.Context) error {
	if e == nil {
		return nil
	}

	if e.db != nil {
		e.db.Close(ctx)
	}

	if e.idTokenCache != nil {
		e.idTokenCache.StopBackgroundExpiration()
	}

	return nil
}
