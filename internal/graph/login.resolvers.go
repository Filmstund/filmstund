package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) LoginUser(ctx context.Context) (*model.User, error) {
	prin := principal.FromContext(ctx)
	logger := logging.FromContext(ctx).
		With("subject", prin.Subject)

	query, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		logger.Warnw("failed to setup database query interface", "err", err)
		return nil, errLoginFailure
	}
	defer cleanup()

	exists, err := query.UserExistsBySubject(ctx, prin.Subject.String())
	if err != nil {
		logger.Infow("failed to query for user existence", "err", err)
		return nil, errLoginFailure
	}

	if exists {
		// TODO: we might need to update the info from the ID token here. Include from the frontend?
		updatedUser, err := query.UpdateLoginTimes(ctx, prin.Subject.String())
		if err != nil {
			logger.Infow("failed to update login times", "err", err)
			return nil, errLoginFailure
		}
		return mappers.ToGraphUser(updatedUser, r.siteCfg), nil
	}

	idToken, err := r.auth0Service.FetchIDToken(ctx)
	if err != nil {
		logger.Warnw("failed to fetch the ID token", "err", err)
		return nil, errLoginFailure
	}

	_, err = query.CreateUpdateUser(ctx, sqlc.CreateUpdateUserParams{
		Subject:   prin.Subject.String(),
		FirstName: idToken.GivenName,
		LastName:  idToken.FamilyName,
		Nick: sql.NullString{
			String: idToken.Nickname,
			Valid:  true,
		},
		Email: idToken.Email,
		Avatar: sql.NullString{
			String: idToken.Picture,
			Valid:  true,
		},
	})
	if err != nil {
		logger.Infow("failed to create user", "err", err)
		return nil, errLoginFailure
	}
	// TODO:remove?
	return mappers.ToGraphUser(sqlc.User{}, r.siteCfg), nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
