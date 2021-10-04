package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) UpdateUser(ctx context.Context, newInfo model.UserDetailsInput) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	var user sqlc.User
	err := r.db.DoQuery(ctx, func(q *sqlc.Queries) error {
		u, err := q.UpdateUser(ctx, mappers.ToUpdateUserParams(newInfo, princ.Subject))
		if err != nil {
			return err
		}
		user = u
		return nil
	})
	if err != nil {
		logger.Infow("failed to update user", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to update user")
	}
	return mappers.ToGraphUser(user, r.siteCfg), nil
}

func (r *mutationResolver) InvalidateCalendarFeed(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	var user *model.User
	err := r.db.DoQuery(ctx, func(q *sqlc.Queries) error {
		u, err := q.RandomizeCalendarFeed(ctx, princ.Subject.String())
		if err != nil {
			return err
		}

		user = mappers.ToGraphUser(u, r.siteCfg)
		return nil
	})
	if err != nil {
		logger.Infow("failed to invalidate calendar feed", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to invalidate calendar feed")
	}
	return user, nil
}

func (r *mutationResolver) DisableCalendarFeed(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	var user *model.User
	err := r.db.DoQuery(ctx, func(q *sqlc.Queries) error {
		u, err := q.DisableCalendarFeed(ctx, princ.Subject.String())
		if err != nil {
			return err
		}

		user = mappers.ToGraphUser(u, r.siteCfg)
		return nil
	})
	if err != nil {
		logger.Infow("failed to disable calendar feed", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to disable calendar feed")
	}
	return user, nil
}

func (r *mutationResolver) AddGiftCertificates(ctx context.Context, giftCerts []*model.GiftCertificateInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteGiftCertificate(ctx context.Context, giftCert model.GiftCertificateInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}
