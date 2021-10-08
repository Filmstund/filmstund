package setup

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/filmstund/filmstund/internal/user"
	"github.com/sethvargo/go-envconfig"
)

type DatabaseConfigProvider interface {
	DatabaseConfig() *database.Config
}

type SessionConfigProvider interface {
	SessionConfig() session.Config
}

func Setup(ctx context.Context, cfg interface{}) (*serverenv.ServerEnv, error) {
	logger := logging.FromContext(ctx)

	// Populate the config with variables from the current env
	if err := envconfig.Process(ctx, cfg); err != nil {
		return nil, fmt.Errorf("failed to process config: %w", err)
	}
	logger.Debugw("using config", "config", cfg)

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
			serverenv.WithUserService(user.NewService(db)),
		)
	}

	// Session storage
	if provider, ok := cfg.(SessionConfigProvider); ok {
		sessCfg := provider.SessionConfig()
		sessionStorage, err := session.NewStorage(sessCfg)
		if err != nil {
			return nil, fmt.Errorf("couldn't setup the session storage: %w", err)
		}
		options = append(options, serverenv.WithSessionStorage(sessionStorage))
	}

	return serverenv.New(ctx, options...), nil
}
