package serverenv

import (
	"context"

	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/security/principal"
)

type ServerEnv struct {
	db             *database.DB
	principalCache *principal.Cache
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

func WithPrincipalCache(cache *principal.Cache) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.principalCache = cache
		return env
	}
}

func (e *ServerEnv) PrincipalCache() *principal.Cache {
	return e.principalCache
}

func (e *ServerEnv) Close(ctx context.Context) error {
	if e == nil {
		return nil
	}

	if e.db != nil {
		e.db.Close(ctx)
	}

	if e.principalCache != nil {
		e.principalCache.StopBackgroundExpiration()
	}

	return nil
}
