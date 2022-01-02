package setup

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/go-redis/redis/v8"
	"github.com/sethvargo/go-envconfig"
)

type DatabaseConfigProvider interface {
	DatabaseConfig() *database.Config
}

type RedisConfigProvider interface {
	RedisConfig() serverenv.RedisConfig
}

func Setup(ctx context.Context, cfg interface{}) (*serverenv.ServerEnv, error) {
	logger := logging.FromContext(ctx)

	// Populate the config with variables from the current env
	if err := envconfig.Process(ctx, cfg); err != nil {
		return nil, fmt.Errorf("failed to process config: %w", err)
	}
	logger.V(1).Info("using config", "config", cfg)

	options := make([]serverenv.Option, 0, 3)

	// Database connection pooling
	if provider, ok := cfg.(DatabaseConfigProvider); ok {
		dbCfg := provider.DatabaseConfig()
		db, err := database.New(ctx, dbCfg)
		if err != nil {
			return nil, fmt.Errorf("couldn't setup database: %w", err)
		}

		options = append(options,
			serverenv.WithDatabase(db),
		)
	}

	if provider, ok := cfg.(RedisConfigProvider); ok {
		redisCfg := provider.RedisConfig()
		client := redis.NewClient(&redis.Options{
			Addr:     fmt.Sprintf("%s:%s", redisCfg.Host, redisCfg.Port),
			Password: redisCfg.Password,
			DB:       0,
		})
		if err := client.Ping(ctx).Err(); err != nil {
			return nil, fmt.Errorf("failed to ping Redis: %w", err)
		}
		options = append(options,
			serverenv.WithRedis(client),
		)
	}

	return serverenv.New(ctx, options...), nil
}
