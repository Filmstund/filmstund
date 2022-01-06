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
	// this is ripped directly from their HTML source
	return []*model.FilmstadenCityAlias{
		{
			Name:  "Alingsås",
			Alias: "AL",
		},
		{
			Name:  "Borås",
			Alias: "BS",
		},
		{
			Name:  "Borlänge",
			Alias: "BO",
		},
		{
			Name:  "Eskilstuna",
			Alias: "EA",
		},
		{
			Name:  "Falun",
			Alias: "FN",
		},
		{
			Name:  "Gävle",
			Alias: "GA",
		},
		{
			Name:  "Göteborg",
			Alias: "GB",
		},
		{
			Name:  "Halmstad",
			Alias: "HD",
		},
		{
			Name:  "Härnösand",
			Alias: "HS",
		},
		{
			Name:  "Helsingborg",
			Alias: "HE",
		},
		{
			Name:  "Höllviken",
			Alias: "HV",
		},
		{
			Name:  "Hudiksvall",
			Alias: "HL",
		},
		{
			Name:  "Jönköping",
			Alias: "JO",
		},
		{
			Name:  "Kalmar",
			Alias: "KL",
		},
		{
			Name:  "Karlskrona",
			Alias: "KK",
		},
		{
			Name:  "Karlstad",
			Alias: "KA",
		},
		{
			Name:  "Katrineholm",
			Alias: "KM",
		},
		{
			Name:  "Köping",
			Alias: "KP",
		},
		{
			Name:  "Kristianstad",
			Alias: "KD",
		},
		{
			Name:  "Kungsbacka",
			Alias: "KB",
		},
		{
			Name:  "Landskrona",
			Alias: "LK",
		},
		{
			Name:  "Linköping",
			Alias: "LI",
		},
		{
			Name:  "Luleå",
			Alias: "LU",
		},
		{
			Name:  "Lund",
			Alias: "LD",
		},
		{
			Name:  "Malmö",
			Alias: "MA",
		},
		{
			Name:  "Mariestad",
			Alias: "MD",
		},
		{
			Name:  "Mjölby",
			Alias: "MJ",
		},
		{
			Name:  "Mora",
			Alias: "MR",
		},
		{
			Name:  "Motala",
			Alias: "ML",
		},
		{
			Name:  "Norrköping",
			Alias: "NO",
		},
		{
			Name:  "Norrtälje",
			Alias: "NT",
		},
		{
			Name:  "Nyköping",
			Alias: "NG",
		},
		{
			Name:  "Örebro",
			Alias: "OR",
		},
		{
			Name:  "Örnsköldsvik",
			Alias: "OK",
		},
		{
			Name:  "Östersund",
			Alias: "OS",
		},
		{
			Name:  "Sälen",
			Alias: "SN",
		},
		{
			Name:  "Skara",
			Alias: "SA",
		},
		{
			Name:  "Skellefteå",
			Alias: "ST",
		},
		{
			Name:  "Skövde",
			Alias: "SK",
		},
		{
			Name:  "Söderhamn",
			Alias: "SH",
		},
		{
			Name:  "Stockholm",
			Alias: "SE",
		},
		{
			Name:  "Strängnäs",
			Alias: "SS",
		},
		{
			Name:  "Trelleborg",
			Alias: "TR",
		},
		{
			Name:  "Uddevalla",
			Alias: "UD",
		},
		{
			Name:  "Umeå",
			Alias: "UM",
		},
		{
			Name:  "Uppsala",
			Alias: "UP",
		},
		{
			Name:  "Vänersborg",
			Alias: "VG",
		},
		{
			Name:  "Varberg",
			Alias: "VB",
		},
		{
			Name:  "Värnamo",
			Alias: "VR",
		},
		{
			Name:  "Västerås",
			Alias: "VA",
		},
		{
			Name:  "Västervik",
			Alias: "VS",
		},
		{
			Name:  "Växjö",
			Alias: "VO",
		},
		{
			Name:  "Vetlanda",
			Alias: "VL",
		},
		{
			Name:  "Visby",
			Alias: "VY",
		},
		{
			Name:  "Ystad",
			Alias: "YD",
		},
	}, nil
}
