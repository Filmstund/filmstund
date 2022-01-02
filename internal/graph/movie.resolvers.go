package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
	pgx "github.com/jackc/pgx/v4"
)

func (r *mutationResolver) FetchNewMoviesFromFilmstaden(ctx context.Context) ([]*model.Movie, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Movie(ctx context.Context, id string) (*model.Movie, error) {
	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to setup DB query interface: %w", err)
	}
	defer cleanup()
	movie, err := q.Movie(ctx, uuid.MustParse(id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		logging.FromContext(ctx).Error(err, "failed to fetch movie", "id", id)
		return nil, fmt.Errorf("failed to fetch movie")
	}
	return movie.GraphMovie(), nil
}

func (r *queryResolver) AllMovies(ctx context.Context) ([]*model.Movie, error) {
	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to setup DB query interface: %w", err)
	}
	defer cleanup()
	dbMovies, err := q.AllMovies(ctx, false)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to fetch movies")
		return nil, fmt.Errorf("failed to fetch movies")
	}
	movies := make([]*model.Movie, len(dbMovies))
	for i, movie := range dbMovies {
		movies[i] = movie.GraphMovie()
	}
	return movies, nil
}

func (r *queryResolver) ArchivedMovies(ctx context.Context) ([]*model.Movie, error) {
	q, cleanup, err := r.db.Queries(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to setup DB query interface: %w", err)
	}
	defer cleanup()
	dbMovies, err := q.AllMovies(ctx, true)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to fetch movies")
		return nil, fmt.Errorf("failed to fetch movies")
	}
	movies := make([]*model.Movie, len(dbMovies))
	for i, movie := range dbMovies {
		movies[i] = movie.GraphMovie()
	}
	return movies, nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
