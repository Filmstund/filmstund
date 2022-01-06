package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/themoviedb-go"
	"github.com/go-logr/logr"
)

type updater struct {
	db   *database.DB
	tmdb *themoviedb.Client
}

func (updater *updater) updateMoviePopularities(ctx context.Context) error {
	logger := logging.FromContext(ctx)
	q := database.FromContext(ctx)

	outdatedMovies, err := q.OutdatedMovies(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch outdated movies: %w", err)
	}
	logger.V(1).Info("updating movie popularity", "count", len(outdatedMovies))

	for _, movie := range outdatedMovies {
		select {
		case <-ctx.Done():
			return nil
		default:
		}
		movie := movie // fix for a common go caveat (implicit memory alias)...
		if err := updater.updateMoviePopularity(ctx, q, &movie); err != nil {
			logger.Info("failed to update movie popularity", "error", err, "movie", movie)
		}
		time.Sleep(1337 * time.Millisecond) // TODO: random duration
	}

	return nil
}

func (updater *updater) updateMoviePopularity(ctx context.Context, queries *dao.Queries, movie *dao.OutdatedMoviesRow) error {
	logger := logging.FromContext(ctx).
		WithValues("movieTitle", movie.Title, "movieID", movie.ID)

	var (
		tmdbID     *int64
		imdbID     *string
		popularity float64
	)

	if movie.TmdbID.Valid {
		logger.V(3).Info("fetching movie details")
		tmdbID = &movie.TmdbID.Int64
		details, err := updater.tmdb.MovieDetails(ctx, *tmdbID)
		if err != nil {
			return fmt.Errorf("failed too lookup movie details for %d: %w", *tmdbID, err)
		}
		imdbID = &details.ImdbID
		popularity = details.Popularity
	} else {
		id, pop, err := updater.searchForMovie(ctx, logger, movie)
		if err != nil {
			return err
		}
		tmdbID = id
		popularity = pop
	}

	if tmdbID == nil {
		logger.Info("didn't find a matching movie on TMDB - disabling future queries for this movie")
		if err := queries.DisableMoviePopularity(ctx, movie.ID); err != nil {
			return fmt.Errorf("failed to disable movie popularity on %s: %w", movie.ID, err)
		}
		return nil
	}

	if imdbID == nil {
		externalIDs, err := updater.tmdb.MovieExternalIDs(ctx, *tmdbID)
		if err != nil {
			logger.Info("failed to fetch external IDs", "error", err)
		}
		imdbID = externalIDs.ImdbID
	}

	logger.V(2).Info("updating popularity and external IDs for movie",
		"popularity", popularity,
		"tmdbID", tmdbID,
		"imdbID", imdbID,
	)
	if err := queries.UpdateMoviePopularity(ctx, dao.UpdateMoviePopularityParams{
		Popularity: popularity,
		TmdbID:     nullInt64(tmdbID),
		ImdbID:     nullString(imdbID),
		MovieID:    movie.ID,
	}); err != nil {
		logger.Error(err, "failed to update popularity on movie")
	}

	return nil
}

func (updater *updater) searchForMovie(ctx context.Context, logger logr.Logger, movie *dao.OutdatedMoviesRow) (*int64, float64, error) {
	logger.V(3).Info("searching for movie...",
		"productionYear", movie.ProductionYear,
		"releaseYear", movie.ReleaseYear,
	)
	searchResult, err := updater.tmdb.SearchMovie(ctx, movie.Title, int(movie.ReleaseYear))
	if err != nil {
		return nil, 0, fmt.Errorf("tmdb search failed: %w", err)
	}

	if searchResult.TotalResults == 0 {
		logger.V(3).Info("no results found using release year, trying production year",
			"productionYear", movie.ProductionYear,
			"releaseYear", movie.ReleaseYear,
		)
		searchResult, err = updater.tmdb.SearchMovie(ctx, movie.Title, int(movie.ProductionYear))
		if err != nil {
			return nil, 0, fmt.Errorf("tmdb search failed using production year: %w", err)
		}
	}

	logger.V(4).Info("movie search results", "totalResults", searchResult.TotalResults)
	if searchResult.TotalResults == 1 {
		logger.V(4).Info("found single match")
		res := searchResult.Results[0]
		return &res.ID, res.Popularity, nil
	}

	for _, result := range searchResult.Results {
		if result.OriginalTitle == movie.Title && result.Popularity > 0 {
			logger.V(4).Info("found match (with more than 1 result)")
			return &result.ID, result.Popularity, nil
		}
	}

	return nil, 0, nil
}

func nullString(str *string) sql.NullString {
	if str == nil {
		return sql.NullString{
			Valid: false,
		}
	}
	return sql.NullString{
		Valid:  true,
		String: *str,
	}
}

func nullInt64(i *int64) sql.NullInt64 {
	if i == nil || *i == 0 {
		return sql.NullInt64{Valid: false}
	}
	return sql.NullInt64{
		Int64: *i,
		Valid: true,
	}
}
