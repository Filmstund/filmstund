package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/go-logr/logr"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/sethvargo/go-envconfig"
	"github.com/spf13/pflag"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := logging.NewLoggerFromEnv()
	ctx = logging.WithLogger(ctx, logger)

	defer func() {
		stop()
		if r := recover(); r != nil {
			logger.Info("application panic", "panic", r)
			os.Exit(1)
		}
	}()

	if err := realMain(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Error(err, "migration error")
	}
}

func realMain(ctx context.Context) error {
	pathToMigrations := pflag.StringP("path", "p", "./configs/database/migrations", "Path to your migration files")
	timeout := pflag.DurationP("timeout", "t", 30*time.Second, "The maximum time the migrations may take")

	pflag.Parse()
	if pathToMigrations == nil || *pathToMigrations == "" {
		pflag.Usage()
		return fmt.Errorf("bad usage")
	}

	logger := logging.FromContext(ctx)
	var cfg database.Config
	err := envconfig.Process(ctx, &cfg)
	if err != nil {
		return fmt.Errorf("unable to process the config: %w", err)
	}
	logger.Info("using database config", "config", cfg)

	file := fmt.Sprintf("file://%s", *pathToMigrations)
	mig, err := migrate.New(file, cfg.PGXConnectionString())
	if err != nil {
		return fmt.Errorf("unable to setup migrate: %w", err)
	}
	mig.LockTimeout = *timeout
	mig.Log = &migLogger{logger: logger.WithName("migrater")}

	logger.Info("running database migrations", "source", *pathToMigrations)
	if err = mig.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("unable to run Up(): %w", err)
	}

	srcErr, dbErr := mig.Close()
	if srcErr != nil {
		return fmt.Errorf("migrate source error: %w", err)
	}
	if dbErr != nil {
		return fmt.Errorf("migrate database error: %w", err)
	}

	logger.Info("migrations complete")
	return nil
}

// migLogger is an implementation of the interface that the migrate lib expects.
type migLogger struct {
	logger logr.Logger
}

func (s *migLogger) Printf(format string, v ...interface{}) {
	s.logger.Info(fmt.Sprintf(strings.TrimSpace(format), v...))
}

func (s *migLogger) Verbose() bool {
	return true
}
