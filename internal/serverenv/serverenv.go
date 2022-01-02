package serverenv

import (
	"context"

	"github.com/filmstund/filmstund/internal/database"
	"github.com/go-redis/redis/v8"
)

type ServerEnv struct {
	db    *database.DB
	redis *redis.Client
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

func WithRedis(redis *redis.Client) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.redis = redis
		return env
	}
}

func (e *ServerEnv) Redis() *redis.Client {
	return e.redis
}

func (e *ServerEnv) Close(ctx context.Context) error {
	if e == nil {
		return nil
	}

	if e.db != nil {
		e.db.Close(ctx)
	}

	if e.redis != nil {
		return e.redis.Close()
	}

	return nil
}
