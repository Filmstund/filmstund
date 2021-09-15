package main

import (
	"context"
	"errors"
	"log"
	"os/signal"
	"syscall"

	"github.com/filmstund/filmstund/internal/logging"
	"go.uber.org/zap"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)

	logger := logging.NewLogger()
	defer logger.Sync() //nolint:errcheck

	defer func() {
		stop()
		if r := recover(); r != nil {
			logger.Fatalw("application panic", zap.Any("panic-info", r))
		}
	}()

	if err := realMain(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Fatal("Fork, main borked", zap.Error(err))
	}
}

func realMain(ctx context.Context) error {
	log.Println("hello world, until ctrl+c!")
	<-ctx.Done()
	return ctx.Err()
}
