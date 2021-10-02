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
	"github.com/sethvargo/go-envconfig"
	"go.uber.org/zap"
)

type LoggerConfig struct {
	Level           string `env:"LOGGER_LEVEL, default=INFO"`
	DevelopmentMode bool   `env:"LOGGER_DEVELOPMENT_MODE, default=true"`
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := setupLogger(ctx)
	defer logger.Sync() //nolint:errcheck
	ctx = logging.WithLogger(ctx, logger)

	if err := os.Setenv("TZ", "UTC"); err != nil {
		logger.Warnw("failed to change timezone to UTC", "err", err)
	}

	defer func() {
		stop()
		if r := recover(); r != nil {
			logger.Fatalw("application panic", "panic", r)
		}
	}()

	if err := realMain(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Errorw("application error", "err", err)
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

	fs, err := cinema.NewServer(&cfg, env)
	if err != nil {
		return fmt.Errorf("cinema.New: %w", err)
	}

	return srv.ServeHTTPHandler(ctx, fs.Routes(ctx))
}

func setupLogger(ctx context.Context) *zap.SugaredLogger {
	loggerCfg := new(LoggerConfig)
	err := envconfig.Process(ctx, loggerCfg)
	if err != nil {
		logging.DefaultLogger().Warnw("failed to process logger config", "error", err)
		loggerCfg = &LoggerConfig{
			Level:           "INFO",
			DevelopmentMode: true,
		}
	}

	logger := logging.NewLogger(loggerCfg.Level, loggerCfg.DevelopmentMode)
	return logger
}
