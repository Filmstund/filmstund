package graph

import (
	"context"
	"errors"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/site"
	"github.com/jackc/pgx/v4"
)

func fetchUser(ctx context.Context, siteCfg site.Config) (*model.User, error) {
	logger := logging.FromContext(ctx)
	prin := principal.FromContext(ctx)
	q := database.FromContext(ctx)

	user, err := q.GetUser(ctx, prin.ID)
	if err != nil {
		logger.Info("failed to get user", "id", prin.ID, "err", err)
		if errors.Is(err, pgx.ErrNoRows) {
			// TODO: invalidate session and return 401 somehow
			return nil, fmt.Errorf("user doesn't exist")
		}
		return nil, fmt.Errorf("failed to fetch user info")
	}
	return mappers.ToGraphUser(user, siteCfg), nil
}
