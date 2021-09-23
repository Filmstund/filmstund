package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/filmstund/filmstund/internal/cinema"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/server"
	"github.com/filmstund/filmstund/internal/setup"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := logging.NewLogger()
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
