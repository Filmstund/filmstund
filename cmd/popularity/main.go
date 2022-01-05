package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/filmstund/themoviedb-go"
)

type PopularityConfig struct {
	CheckInterval time.Duration `env:"CHECK_INTERVAL, default=25h"`
	TMDBAPIKey    string        `env:"TMDB_API_KEY, required"`
	Database      database.Config
}

func (cfg *PopularityConfig) DatabaseConfig() *database.Config {
	return &cfg.Database
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := logging.NewLoggerFromEnv()
	ctx = logging.WithLogger(ctx, logger)

	if err := os.Setenv("TZ", "UTC"); err != nil {
		logger.Info("failed to change timezone to UTC", "err", err)
	}

	defer func() {
		stop()
		if r := recover(); r != nil {
			logger.Error(nil, "application panic", "panic", r)
			os.Exit(1)
		}
	}()

	if err := realMain(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Error(err, "application error")
	}
}

func realMain(ctx context.Context) error {
	var cfg PopularityConfig

	env, err := setup.Setup(ctx, &cfg)
	if err != nil {
		return fmt.Errorf("failed to setup server environment: %w", err)
	}
	defer env.Close(ctx)

	client, err := themoviedb.NewClient(ctx, cfg.TMDBAPIKey)
	if err != nil {
		return fmt.Errorf("failed to setup tmdb client: %w", err)
	}
	updater := updater{
		db:   env.Database(),
		tmdb: client,
	}

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()
	logger := logging.FromContext(ctx)

	for {
		select {
		case <-ticker.C:
			nextCheckAt := time.Now().Add(cfg.CheckInterval) // TODO: random duration
			ticker.Reset(cfg.CheckInterval)
			if err := updater.updateMoviePopularities(ctx); err != nil {
				logger.Error(err, "failed to update movie popularity. Continuing anyway...")
			}
			logger.V(1).Info("scheduled next update", "nextCheck", nextCheckAt)
		case <-ctx.Done():
			return nil
		}
	}
}
