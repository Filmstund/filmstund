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
		logger.Fatalf("application error: %v", err)
	}
}

func realMain(ctx context.Context) error {
	srv, err := server.New(":8080")
	if err != nil {
		return fmt.Errorf("server.New: %w", err)
	}

	fs, err := fileserver.NewServer("./web/build")
	if err != nil {
		return fmt.Errorf("fileserver.New: %w", err)
	}

	return srv.ServeHTTPHandler(ctx, fs.Routes(ctx))
}
