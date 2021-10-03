package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/mappers"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/security/principal"
)

func (r *mutationResolver) LoginUser(ctx context.Context) (*model.User, error) {
	logger := logging.FromContext(ctx)
	prin := principal.FromContext(ctx)

	var user sqlc.User
	err := r.db.DoQuery(ctx, func(q *sqlc.Queries) error {
		exists, err := q.UserExistsBySubject(ctx, prin.Sub.String())
		if err != nil {
			return err
		}

		if exists {
			user, err = q.UpdateLoginTimes(ctx, sqlc.UpdateLoginTimesParams{
				Avatar: sql.NullString{
					String: prin.Picture,
					Valid:  true,
				},
				SubjectID: prin.Sub.String(),
			})
		} else {
			user, err = q.CreateUser(ctx, sqlc.CreateUserParams{
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
		}

		return err
	})
	if err != nil {
		logger.Warnw("failed to create/update user", "subject", prin.Sub, "err", err)
		return nil, fmt.Errorf("failed to login user")
	}

	return mappers.ToGraphUser(user, r.siteCfg), nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
