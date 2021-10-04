package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) LoginUser(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	prin := principal.FromContext(ctx)

	var user sqlc.User
	err := r.db.DoQuery(ctx, func(q *sqlc.Queries) error {
		exists, err := q.UserExistsBySubject(ctx, prin.Subject.String())
		if err != nil {
			return err
		}

		if exists {
			// TODO: we might need to update the info from the ID token here. Include from the frontend?
			updatedUser, err := q.UpdateLoginTimes(ctx, prin.Subject.String())
			if err != nil {
				return err
			}
			user = updatedUser
		} else {
			idToken, err := r.auth0Service.FetchIDToken(ctx)
			if err != nil {
				return err
			}

			createdUser, err := q.CreateUser(ctx, sqlc.CreateUserParams{
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
				return err
			}
			user = createdUser
		}

		return nil
	})
	if err != nil {
		logger.Warnw("failed to create/update user", "subject", prin.Subject, "err", err)
		return nil, fmt.Errorf("failed to login user")
	}

	return mappers.ToGraphUser(user, r.siteCfg), nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
