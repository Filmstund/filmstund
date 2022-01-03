package filmstaden_test

import (
	"context"
	"time"

	"github.com/filmstund/filmstund/filmstaden"
	"github.com/go-redis/redis/v8"
)

var _ filmstaden.QueryCache = (*noopCache)(nil)

// NoopCache is a cache implementation that does nothing.
type noopCache struct{}

func NoopCache() filmstaden.QueryCache {
	return &noopCache{}
}

func (n *noopCache) Get(ctx context.Context, key string) *redis.StringCmd {
	return redis.NewStringResult("", redis.Nil)
}

func (n *noopCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd {
	return redis.NewStatusResult("", redis.Nil)
}
