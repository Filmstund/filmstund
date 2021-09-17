package main

import (
	"context"
	"errors"
	"fmt"
	"os/signal"
	"syscall"

	"github.com/filmstund/filmstund/internal/fileserver"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/server"
	"github.com/filmstund/filmstund/internal/setup"
	"go.uber.org/zap"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := logging.NewLogger()
	defer logger.Sync() //nolint:errcheck
	ctx = logging.WithLogger(ctx, logger)

	defer func() {
		stop()
		if r := recover(); r != nil {
			logger.Fatalw("application panic", zap.Any("panic-info", r))
		}
	}()

	if err := realMain(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Fatalw("application error", "err", err)
	}
}

func realMain(ctx context.Context) error {
	var cfg fileserver.Config
	if err := setup.Setup(ctx, &cfg); err != nil {
		return fmt.Errorf("failed to setup server environment: %w", err)
	}

	srv, err := server.New(cfg.ListenAddr)
	if err != nil {
		return fmt.Errorf("server.New: %w", err)
	}

	fs, err := fileserver.NewServer(&cfg)
	if err != nil {
		return fmt.Errorf("fileserver.New: %w", err)
	}

	return srv.ServeHTTPHandler(ctx, fs.Routes(ctx))
}
