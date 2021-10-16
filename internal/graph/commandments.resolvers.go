package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *queryResolver) AllCommandments(ctx context.Context) ([]*model.Commandments, error) {
	logger := logging.FromContext(ctx)

	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("AllCommandments: %w", err)
	}
	defer cleanup()

	all, err := q.ListCommandments(ctx)
	if err != nil {
		logger.Warnw("AllCommandments failed", "err", err)
		return nil, fmt.Errorf("failed to list all commandments: %w", err)
	}

	commandments := make([]*model.Commandments, 0, len(all))
	for _, row := range all {
		commandments = append(commandments, &model.Commandments{
			Number: int(row.Number),
			Phrase: row.Phrase,
		})
	}
	return commandments, nil
}

func (r *queryResolver) RandomCommandment(ctx context.Context) (*model.Commandments, error) {
	logger := logging.FromContext(ctx)

	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("AllCommandments: %w", err)
	}
	defer cleanup()

	rnd, err := q.RandomCommandment(ctx)
	if err != nil {
		logger.Warnw("RandomCommandment failed", "err", err)
		return nil, fmt.Errorf("RandomCommandment query failed: %w", err)
	}

	commandment := model.Commandments{
		Number: int(rnd.Number),
		Phrase: rnd.Phrase,
	}
	return &commandment, nil
}

// Query returns gql.QueryResolver implementation.
func (r *Resolver) Query() gql.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
