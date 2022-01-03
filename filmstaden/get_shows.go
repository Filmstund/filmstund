package filmstaden

import (
	"context"
	"fmt"
	"time"
)

type Shows struct {
	TotalCount int `json:"totalNbrOfItems"`
	Items      []struct {
		RemoteEntityID   string        `json:"reId"`
		MovieID          string        `json:"mId"`  // maps to movie ncgId (NCG = Nordic Cinema Group)
		MovieVersionID   string        `json:"mvId"` // same as above but versioned (IMAX, Svenskt tal etc.)
		CinemaID         string        `json:"cId"`
		CinemaTitle      string        `json:"ct"`
		ScreenID         string        `json:"sId"`
		ScreenTitle      string        `json:"st"`
		ScreenAttributes []string      `json:"sa"`
		UTC              time.Time     `json:"utc"`
		Restrictions     []interface{} `json:"res"`
	} `json:"items"`
}

// UniqueMovieIDs extracts all movie ids from the all shows.
func (shows *Shows) UniqueMovieIDs() []string {
	ids := make(map[string]struct{})
	for _, show := range shows.Items {
		ids[show.MovieID] = struct{}{}
	}
	movieIDs := make([]string, 0, len(ids))
	for movieID := range ids {
		movieIDs = append(movieIDs, movieID)
	}
	return movieIDs
}

func (client *Client) Shows(ctx context.Context, page int, cityAlias string) (*Shows, error) {
	url := fmt.Sprintf(
		"%s/show/stripped/sv/%d/1024?filter.countryAlias=se&filter.cityAlias=%s",
		client.baseURL,
		page,
		cityAlias,
	)
	shows := new(Shows)
	if err := client.decodedGet(ctx, url, shows); err != nil {
		return nil, fmt.Errorf("shows: %w", err)
	}
	return shows, nil
}
