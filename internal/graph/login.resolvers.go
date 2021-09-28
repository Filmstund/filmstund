package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/logging"
	"github.com/filmstund/filmstund/internal/security/principal"
)

func (r *mutationResolver) LoginUser(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)

	prin := principal.FromContext(ctx)
	var user sqlc.NewOrExistingUserRow
	var err error

	err = r.DB.DoQuery(ctx, func(q *sqlc.Queries) error {
		user, err = q.NewOrExistingUser(ctx, sqlc.NewOrExistingUserParams{
			Subject:   prin.Sub.String(),
			FirstName: prin.GivenName,
			LastName:  prin.FamilyName,
			Nick: sql.NullString{
				String: prin.Nickname,
				Valid:  true,
			},
			Email: prin.Email,
			Avatar: sql.NullString{
				String: prin.Picture,
				Valid:  true,
			},
		})
		return err
	})
	if err != nil {
		logger.Warnw("failed to create/get user", "subject", prin.Sub, "err", err)
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	toString := func(v sql.NullString) *string {
		if v.Valid {
			return &v.String
		}
		return nil
	}

	return &model.User{
		ID:                     user.ID.String(),
		FilmstadenMembershipID: toString(user.FilmstadenMembershipID),
		Name:                   fmt.Sprintf("%s %s", user.FirstName, user.LastName),
		FirstName:              user.FirstName,
		LastName:               user.LastName,
		Nick:                   toString(user.Nick),
		Email:                  user.Email,
		Phone:                  toString(user.Phone),
		AvatarURL:              toString(user.Avatar),
		LastLogin:              user.LastLogin,
		SignupDate:             user.SignupDate,
		LastModifiedDate:       user.LastModifiedDate,
	}, nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
