package serverenv

import (
	"context"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/go-redis/redis/v8"
	"golang.org/x/oauth2"
)

type ServerEnv struct {
	db           *database.DB
	redis        *redis.Client
	oauth2Config oauth2.Config
	oidcProvider *oidc.Provider
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

func (e *ServerEnv) Oauth2Config() oauth2.Config {
	return e.oauth2Config
}

func WithOauth2Config(cfg oauth2.Config) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.oauth2Config = cfg
		return env
	}
}

func (e *ServerEnv) OidcProvider() *oidc.Provider {
	return e.oidcProvider
}

func WithOidcProvider(provider *oidc.Provider) Option {
	return func(env *ServerEnv) *ServerEnv {
		env.oidcProvider = provider
		return env
	}
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
