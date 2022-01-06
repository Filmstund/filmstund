package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *queryResolver) PreviouslyUsedLocations(ctx context.Context) ([]string, error) {
	locations, err := database.FromContext(ctx).PreviouslyUsedLocations(ctx)
	if err != nil {
		logging.FromContext(ctx).Error(err, "query.PreviouslyUsedLocations failed")
		return nil, fmt.Errorf("failed to lookup all previously used locations")
	}
	return locations, nil
}

func (r *queryResolver) FilmstadenCities(ctx context.Context) ([]*model.FilmstadenCityAlias, error) {
	panic(fmt.Errorf("not implemented"))
}
