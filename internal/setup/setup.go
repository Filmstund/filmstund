package setup

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/logging"
	"github.com/sethvargo/go-envconfig"
)

func Setup(ctx context.Context, cfg interface{}) error {
	logger := logging.FromContext(ctx)

	if err := envconfig.Process(ctx, cfg); err != nil {
		return fmt.Errorf("failed to process config: %w", err)
	}
	logger.Debugw("using config", "config", cfg)

	return nil
}
