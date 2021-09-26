package setup

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/security/principal"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/sethvargo/go-envconfig"
)

type DatabaseConfigProvider interface {
	DatabaseConfig() *database.Config
}

type SecurityConfigProvider interface {
	SecurityConfig() *security.Config
}

type IDTokenCacheConfigProvider interface {
	IDTokenCacheConfig() principal.Config
}

func Setup(ctx context.Context, cfg interface{}) (*serverenv.ServerEnv, error) {
	logger := logging.FromContext(ctx)

	// Populate the config with variables from the current env
	if err := envconfig.Process(ctx, cfg); err != nil {
		return nil, fmt.Errorf("failed to process config: %w", err)
	}
	logger.Debugw("using config", "config", cfg)

	options := make([]serverenv.Option, 0, 1)

	// Database connection pooling
	if provider, ok := cfg.(DatabaseConfigProvider); ok {
		dbCfg := provider.DatabaseConfig()
		db, err := database.New(ctx, dbCfg)
		if err != nil {
			return nil, fmt.Errorf("couldn't setup database: %w", err)
		}

		options = append(options, serverenv.WithDatabase(db))
	}

	// ID token cache
	if provider, ok := cfg.(IDTokenCacheConfigProvider); ok {
		cacheConfig := provider.IDTokenCacheConfig()

		cache := principal.NewCache(cacheConfig)
		cache.StartExpiration(ctx)

		options = append(options, serverenv.WithIDTokenCache(cache))
	}

	return serverenv.New(ctx, options...), nil
}
