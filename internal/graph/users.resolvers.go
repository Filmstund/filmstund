package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) UpdateUser(ctx context.Context, newInfo model.UserDetailsInput) (*model.User, error) {
	logger := logging.FromContext(ctx)
	princ := principal.FromContext(ctx)
	q := database.FromContext(ctx)

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
	q := database.FromContext(ctx)

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
	q := database.FromContext(ctx)

	user, err := q.DisableCalendarFeed(ctx, princ.Subject.String())
	if err != nil {
		logger.Info("failed to disable calendar feed", "sub", princ.Subject, "err", err)
		return nil, fmt.Errorf("failed to disable calendar feed")
	}
	return mappers.ToGraphUser(user, r.siteCfg), nil
}

func (r *mutationResolver) AddGiftCertificates(ctx context.Context, giftCerts []*model.GiftCertificateInput) (*model.User, error) {
	logger := logging.FromContext(ctx)
	prin := principal.FromContext(ctx)
	tx, commit, rollback, err := r.db.TX(ctx)
	if err != nil {
		logger.Error(err, "failed to init DB transaction")
		return nil, errInternalServerError
	}

	for _, cert := range giftCerts {
		var expireTime time.Time
		if cert.ExpireTime == nil {
			expireTime = time.Now().AddDate(1, 0, 0)
		} else {
			expireTime = *cert.ExpireTime
		}
		if err := tx.AddGiftCertificate(ctx, dao.AddGiftCertificateParams{
			UserID:     prin.ID,
			Number:     cert.Number,
			ExpireTime: expireTime,
		}); err != nil {
			logger.Info("failed to insert gift cert", "uid", prin.ID, "err", err, "number", cert.Number)
			rollback(ctx)
			return nil, fmt.Errorf("failed to insert gift certificate")
		}
	}
	if err := commit(ctx); err != nil {
		logger.Error(err, "gift certificate TX commit failed")
		return nil, fmt.Errorf("failed to insert gift certificate")
	}
	return fetchUser(ctx, r.siteCfg)
}

func (r *mutationResolver) DeleteGiftCertificate(ctx context.Context, giftCert model.GiftCertificateInput) (*model.User, error) {
	logger := logging.FromContext(ctx)
	prin := principal.FromContext(ctx)
	q := database.FromContext(ctx)

	var expireTime time.Time
	if giftCert.ExpireTime == nil {
		expireTime = time.Now()
	} else {
		expireTime = *giftCert.ExpireTime
	}
	if err := q.DeleteGiftCertificate(ctx, dao.DeleteGiftCertificateParams{
		UserID:     prin.ID,
		Number:     giftCert.Number,
		ExpireTime: expireTime,
	}); err != nil {
		logger.Info("failed to delete gift certificates", "uid", prin.ID, "err", err)
		return nil, fmt.Errorf("failed to delete gift certificates")
	}
	return fetchUser(ctx, r.siteCfg)
}

func (r *queryResolver) CurrentUser(ctx context.Context) (*model.User, error) {
	return fetchUser(ctx, r.siteCfg)
}

func (r *queryResolver) AllUsers(ctx context.Context) ([]*model.PublicUser, error) {
	// TODO: implement
	panic(fmt.Errorf("not implemented"))
}

func (r *userResolver) GiftCertificates(ctx context.Context, obj *model.User) ([]*model.GiftCertificate, error) {
	logger := logging.FromContext(ctx)
	q := database.FromContext(ctx)

	giftCerts, err := q.GetGiftCertificates(ctx, obj.ID)
	if err != nil {
		logger.Info("failed to get user gift certificates", "uid", obj.ID, "err", err)
		return nil, fmt.Errorf("failed to get user gift certificates")
	}
	gcs := make([]*model.GiftCertificate, len(giftCerts))
	for i, gc := range giftCerts {
		gcs[i] = gc.GraphModel(model.GiftCertificateStatusUnknown) // TODO: will have to be calculated
	}
	return gcs, nil
}

// User returns gql.UserResolver implementation.
func (r *Resolver) User() gql.UserResolver { return &userResolver{r} }

type userResolver struct{ *Resolver }
