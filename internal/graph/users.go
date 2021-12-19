package graph

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/site"
)

func fetchUser(ctx context.Context, q *sqlc.Queries, siteCfg site.Config) (*model.User, error) {
	logger := logging.FromContext(ctx)
	prin := principal.FromContext(ctx)
	user, err := q.GetUser(ctx, prin.ID)
	if err != nil {
		logger.Info("failed to get user", "id", prin.ID, "err", err)
		return nil, fmt.Errorf("failed to fetch user info")
	}
	giftCerts, err := q.GetGiftCertificates(ctx, prin.ID)
	if err != nil {
		logger.Info("failed to get user gift certificates", "uid", prin.ID, "err", err)
		return nil, fmt.Errorf("failed to fetch user gift certificates")
	}
	return mappers.ToGraphUser(user, giftCerts, siteCfg), nil
}
