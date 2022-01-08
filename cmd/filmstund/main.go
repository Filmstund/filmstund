package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/cinema"
	"github.com/filmstund/filmstund/internal/server"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/go-logr/logr"
	"github.com/sethvargo/go-envconfig"
)

type LoggerConfig struct {
	Verbosity       int  `env:"LOGGER_VERBOSITY, default=0"`
	DevelopmentMode bool `env:"LOGGER_DEVELOPMENT_MODE, default=true"`
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := setupLogger(ctx)
	ctx = logging.WithLogger(ctx, logger)

	if err := os.Setenv("TZ", "UTC"); err != nil {
		logger.Info("failed to change timezone to UTC", "err", err)
	}

	defer func() {
		stop()
		if r := recover(); r != nil {
			logger.Info("application panic", "panic", r)
			os.Exit(1)
		}
	}()

	if err := realMain(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Error(err, "application error")
		os.Exit(1)
	}
}

func realMain(ctx context.Context) error {
	var cfg cinema.Config

	env, err := setup.Setup(ctx, &cfg)
	if err != nil {
		return fmt.Errorf("failed to setup server environment: %w", err)
	}
	defer env.Close(ctx)

	srv, err := server.New(cfg.ListenAddr)
	if err != nil {
		return fmt.Errorf("server.New: %w", err)
	}

	fs, err := cinema.NewServer(ctx, &cfg, env)
	if err != nil {
		return fmt.Errorf("cinema.New: %w", err)
	}

	return srv.ServeHTTPHandler(ctx, fs.Routes(ctx))
}

func setupLogger(ctx context.Context) logr.Logger {
	loggerCfg := new(LoggerConfig)
	err := envconfig.Process(ctx, loggerCfg)
	if err != nil {
		logging.DefaultLogger().Info("failed to process logger config", "error", err)
		loggerCfg = &LoggerConfig{
			Verbosity:       0,
			DevelopmentMode: true,
		}
	}

	logger := logging.NewLogger(loggerCfg.Verbosity, loggerCfg.DevelopmentMode)
	return logger
}
