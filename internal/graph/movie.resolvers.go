package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
	pgx "github.com/jackc/pgx/v4"
)

func (r *mutationResolver) FetchNewMoviesFromFilmstaden(ctx context.Context) ([]*model.Movie, error) {
	const cityAlias = "GB"
	logger := logging.FromContext(ctx)
	merged, err := r.filmstaden.CurrentMovies(ctx, cityAlias)
	if err != nil {
		logger.Error(err, "failed to request Filmstaden current movies")
		return nil, fmt.Errorf("failed to fetch current movies")
	}

	if merged.TotalCount == 0 {
		return nil, fmt.Errorf("no movies found. Filmstaden failure?")
	}

	q, commit, _, err := r.db.TX(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to setup DB")
	}

	graphMovies := make([]*model.Movie, 0, len(merged.Items))
	for _, item := range merged.Items {
		releaseDate, err := time.Parse("2006-01-02T15:04:05", item.ReleaseDate)
		if err != nil {
			logger.Error(err, "failed to parse release date", "releaseDate", item.ReleaseDate)
		}
		genres := make([]string, len(item.Genres))
		for i, genre := range item.Genres {
			genres[i] = genre.Name
		}

		movie, err := q.UpsertMovie(ctx, dao.UpsertMovieParams{
			ID:           uuid.New(),
			FilmstadenID: item.NcgID,
			Slug:         item.Slug,
			Title:        item.OriginalTitle,
			ReleaseDate: sql.NullTime{
				Time:  releaseDate,
				Valid: true,
			},
			ProductionYear: int32(item.ProductionYear),
			Runtime:        int32(item.Length), // in minutes
			Poster: sql.NullString{
				String: item.PosterURL,
				Valid:  true,
			},
			Genres: genres,
		})
		if err != nil {
			logger.Error(err, "failed to insert movie", "movieID", item.NcgID)
			continue
		}
		graphMovies = append(graphMovies, movie.GraphMovie())
	}

	if err := commit(ctx); err != nil {
		logger.Error(err, "failed to commit movie upsert")
		return nil, fmt.Errorf("failed to insert movies")
	}
	return graphMovies, nil
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
