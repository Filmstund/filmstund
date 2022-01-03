package filmstaden

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

// QueryCache is a copy of the redis client that allows for easy mocking of calls.
type QueryCache interface {
	Get(ctx context.Context, key string) *redis.StringCmd
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd
}
