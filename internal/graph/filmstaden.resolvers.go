package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"strings"
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
	if obj.FilmstadenShowingID == nil {
		// No filmstaden ID == no seat map
		return nil, nil
	}

	idParts := strings.SplitN(*obj.FilmstadenShowingID, "-", 3)
	if len(idParts) != 3 {
		return nil, fmt.Errorf("unknown format for the Filmstaden showing ID")
	}
	layout, err := r.filmstaden.ScreenLayout(ctx, idParts[2])
	if err != nil {
		return nil, fmt.Errorf("failed to fetch screen layout for ID=%s", idParts[2])
	}

	seats := make([]*model.FilmstadenSeatMap, len(layout.Seats))
	for i, seat := range layout.Seats {
		seats[i] = &model.FilmstadenSeatMap{
			Row:      seat.Row,
			Number:   seat.Number,
			SeatType: seat.SeatType,
			Coordinates: &model.FilmstadenSeatCoordinates{
				X: seat.Coordinates.X,
				Y: seat.Coordinates.Y,
			},
			Dimensions: &model.FilmstadenSeatDimensions{
				Width:  seat.Dimensions.Width,
				Height: seat.Dimensions.Height,
			},
		}
	}

	return seats, nil
}
