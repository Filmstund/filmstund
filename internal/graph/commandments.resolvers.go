package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/logging"
)

func (r *queryResolver) AllCommandments(ctx context.Context) ([]*model.Commandments, error) {
	logger := logging.FromContext(ctx)

	var commandments []*model.Commandments
	err := r.DB.DoQuery(ctx, func(q *sqlc.Queries) error {
		all, err := q.ListCommandments(ctx)
		if err != nil {
			return fmt.Errorf("failed to list all commandments: %w", err)
		}

		commandments = make([]*model.Commandments, 0, len(all))
		for _, row := range all {
			commandments = append(commandments, &model.Commandments{
				Number: int(row.Number),
				Phrase: row.Phrase,
			})
		}
		return nil
	})
	if err != nil {
		logger.Warnw("AllCommandments failed", "err", err)
		return nil, fmt.Errorf("couldn't list all commandments")
	}

	return commandments, nil
}

func (r *queryResolver) RandomCommandment(ctx context.Context) (*model.Commandments, error) {
	logger := logging.FromContext(ctx)

	var commandment model.Commandments
	err := r.DB.DoQuery(ctx, func(q *sqlc.Queries) error {
		rnd, err := q.RandomCommandment(ctx)
		if err != nil {
			return fmt.Errorf("RandomCommandment query failed: %w", err)
		}

		commandment = model.Commandments{
			Number: int(rnd.Number),
			Phrase: rnd.Phrase,
		}
		return nil
	})
	if err != nil {
		logger.Warnw("RandomCommandment failed", "err", err)
		return nil, fmt.Errorf("couldn't fetch a random commandment")
	}
	return &commandment, nil
}

// Query returns gql.QueryResolver implementation.
func (r *Resolver) Query() gql.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
