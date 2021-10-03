package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/security/principal"
)

func (r *mutationResolver) UpdateUser(ctx context.Context, newInfo model.UserDetailsInput) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	var user sqlc.User
	err := r.DB.DoQuery(ctx, func(q *sqlc.Queries) error {
		u, err := q.UpdateUser(ctx, mappers.ToUpdateUserParams(newInfo, princ.Sub))
		if err != nil {
			return err
		}
		user = u
		return nil
	})
	if err != nil {
		logger.Infof("failed to update user (%s): %w", princ.Sub, err)
		return nil, fmt.Errorf("failed to update user")
	}
	return mappers.ToGraphUser(user), nil
}

func (r *mutationResolver) InvalidateCalendarFeed(ctx context.Context) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DisableCalendarFeed(ctx context.Context) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) AddGiftCertificates(ctx context.Context, giftCerts []*model.GiftCertificateInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteGiftCertificate(ctx context.Context, giftCert model.GiftCertificateInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}
