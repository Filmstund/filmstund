package logging

import (
	"context"
	"log"
	"sync"

	"go.uber.org/zap"
)

type contextKey string

const loggerKey = contextKey("zaplogger")

// NewLogger creates a new zap logger, based on the environment (TODO).
func NewLogger() *zap.SugaredLogger {
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Printf("unable to create new logger: %v", err)
		logger = zap.NewNop()
	}
	return logger.Sugar()
}

var (
	defaultLogger     *zap.SugaredLogger //nolint:gochecknoglobals
	defaultLoggerOnce sync.Once          //nolint:gochecknoglobals
)

// DefaultLogger gives you a logger with the default settings replied.
func DefaultLogger() *zap.SugaredLogger {
	defaultLoggerOnce.Do(func() {
		defaultLogger = NewLogger()
	})
	return defaultLogger
}

// WithLogger creates a new context with the given logger attached.
func WithLogger(ctx context.Context, logger *zap.SugaredLogger) context.Context {
	return context.WithValue(ctx, loggerKey, logger)
}

// FromContext returns the logger stored within the context.
// If no logger is stored, the default logger is returned.
func FromContext(ctx context.Context) *zap.SugaredLogger {
	if logger, ok := ctx.Value(loggerKey).(*zap.SugaredLogger); ok {
		return logger
	}
	return DefaultLogger()
}
