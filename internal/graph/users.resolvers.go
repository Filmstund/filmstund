package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) UpdateUser(ctx context.Context, newInfo model.UserDetailsInput) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("AllCommandments: %w", err)
	}
	defer cleanup()

	user, err := q.UpdateUser(ctx, mappers.ToUpdateUserParams(newInfo, princ.Subject))
	if err != nil {
		logger.Info("failed to update user", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to update user")
	}
	return mappers.ToGraphUser(user, r.siteCfg), nil
}

func (r *mutationResolver) InvalidateCalendarFeed(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("AllCommandments: %w", err)
	}
	defer cleanup()

	user, err := q.RandomizeCalendarFeed(ctx, princ.Subject.String())
	if err != nil {
		logger.Info("failed to invalidate calendar feed", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to invalidate calendar feed")
	}
	return mappers.ToGraphUser(user, r.siteCfg), nil
}

func (r *mutationResolver) DisableCalendarFeed(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("AllCommandments: %w", err)
	}
	defer cleanup()

	user, err := q.DisableCalendarFeed(ctx, princ.Subject.String())
	if err != nil {
		logger.Info("failed to disable calendar feed", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to disable calendar feed")
	}
	return mappers.ToGraphUser(user, r.siteCfg), nil
}

func (r *mutationResolver) AddGiftCertificates(ctx context.Context, giftCerts []*model.GiftCertificateInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteGiftCertificate(ctx context.Context, giftCert model.GiftCertificateInput) (*model.User, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) CurrentUser(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)

	queries, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		logger.Info("failed to connect to database", "err", err)
		return nil, fmt.Errorf("failed to connect to database")
	}
	defer cleanup()

	user, err := queries.GetUser(ctx, princ.ID)
	if err != nil {
		logger.Info("failed to get user", "id", princ.ID, "err", err)
		return nil, fmt.Errorf("failed to get user")
	}

	return mappers.ToGraphUser(user, r.siteCfg), nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
