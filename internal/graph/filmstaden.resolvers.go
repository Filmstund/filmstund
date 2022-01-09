package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
)

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

func (r *showingResolver) FilmstadenSeatMap(ctx context.Context, obj *model.Showing) ([]*model.FilmstadenSeatMap, error) {
	// TODO: implement
	panic(fmt.Errorf("not implemented"))
}
