package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
	pgx "github.com/jackc/pgx/v4"
)

func (r *mutationResolver) FetchNewMoviesFromFilmstaden(ctx context.Context, cityAlias string) ([]*model.Movie, error) {
	logger := logging.FromContext(ctx).
		WithValues("cityAlias", cityAlias)
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
		var releaseDate time.Time
		if item.ReReleaseDate != nil {
			releaseDate, err = time.Parse("2006-01-02T15:04:05", *item.ReReleaseDate)
		} else {
			releaseDate, err = time.Parse("2006-01-02T15:04:05", item.ReleaseDate)
		}
		if err != nil {
			logger.Error(err, "failed to parse release date",
				"releaseDate", item.ReleaseDate,
				"reReleaseDate", item.ReReleaseDate,
			)
		}
		genres := make([]string, len(item.Genres))
		for i, genre := range item.Genres {
			genres[i] = genre.Name
		}

		movie, err := q.UpsertMovie(ctx, dao.UpsertMovieParams{
			ID:           uuid.New(),
			FilmstadenID: item.NcgID,
			Slug:         item.Slug,
			Title:        strings.TrimSpace(item.OriginalTitle),
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
		graphMovies = append(graphMovies, movie.GraphModel())
	}

	if err := commit(ctx); err != nil {
		logger.Error(err, "failed to commit movie upsert")
		return nil, fmt.Errorf("failed to insert movies")
	}
	return graphMovies, nil
}

func (r *queryResolver) Movie(ctx context.Context, id uuid.UUID) (*model.Movie, error) {
	q := database.FromContext(ctx)
	movie, err := q.Movie(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		logging.FromContext(ctx).Error(err, "failed to fetch movie", "id", id)
		return nil, fmt.Errorf("failed to fetch movie")
	}
	return movie.GraphModel(), nil
}

func (r *queryResolver) AllMovies(ctx context.Context) ([]*model.Movie, error) {
	q := database.FromContext(ctx)
	dbMovies, err := q.AllMovies(ctx, false)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to fetch movies")
		return nil, fmt.Errorf("failed to fetch movies")
	}
	movies := make([]*model.Movie, len(dbMovies))
	for i, movie := range dbMovies {
		movies[i] = movie.GraphModel()
	}
	return movies, nil
}

func (r *queryResolver) ArchivedMovies(ctx context.Context) ([]*model.Movie, error) {
	q := database.FromContext(ctx)
	dbMovies, err := q.AllMovies(ctx, true)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to fetch movies")
		return nil, fmt.Errorf("failed to fetch movies")
	}
	movies := make([]*model.Movie, len(dbMovies))
	for i, movie := range dbMovies {
		movies[i] = movie.GraphModel()
	}
	return movies, nil
}

func (r *queryResolver) FilmstadenShowings(ctx context.Context, movieID uuid.UUID, city *string, afterDate *time.Time) ([]*model.FilmstadenShowing, error) {
	var cityAlias string
	var afterTime time.Time
	if city == nil {
		cityAlias = "GB"
	} else {
		cityAlias = *city
	}
	if afterDate == nil {
		afterTime = time.Unix(0, 0)
	} else {
		afterTime = *afterDate
	}

	logger := logging.FromContext(ctx).
		WithValues(
			"movieID", movieID,
			"cityAlias", cityAlias,
			"afterDate", afterDate,
		)

	fsMovieID, err := database.FromContext(ctx).LookupFilmstadenID(ctx, movieID)
	if err != nil {
		logger.Error(err, "query.LookupFilmstadenID failed")
		return nil, fmt.Errorf("failed to lookup FS movie ID")
	}

	shows, err := r.filmstaden.ShowsForMovie(ctx, 1, cityAlias, fsMovieID, afterTime)
	if err != nil {
		logger.Error(err, "filmstaden.ShowsForMovie failed")
		return nil, fmt.Errorf("failed to fetch shows from Filmstaden")
	}

	fsShows := make([]*model.FilmstadenShowing, len(shows.Items))
	for i, show := range shows.Items {
		fsShows[i] = &model.FilmstadenShowing{
			ID: show.RemoteEntityID,
			Cinema: &model.FilmstadenCinema{
				FilmstadenID: show.CinemaID,
				Name:         show.CinemaTitle,
			},
			Screen: &model.FilmstadenScreen{
				FilmstadenID: show.ScreenID,
				Name:         show.ScreenTitle,
			},
			TimeUtc: show.UTC,
			Tags:    show.ScreenAttributes,
		}
	}

	return fsShows, nil
}
