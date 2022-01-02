package filmstaden

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"edholm.dev/go-logging"
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
	timeout, cancelFunc := context.WithTimeout(ctx, requestTimeout)
	defer cancelFunc()
	url := fmt.Sprintf(
		"%s/show/stripped/sv/%d/1024?filter.countryAlias=se&filter.cityAlias=%s",
		client.baseURL,
		page,
		cityAlias,
	)
	req, err := http.NewRequestWithContext(timeout, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to setup request: %w", err)
	}
	logging.FromContext(ctx).V(2).Info("requesting Filmstaden shows", "url", url)
	resp, err := client.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to request Filmstaden shows: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		logging.FromContext(ctx).Info("failed to fetch Filmstaden shows",
			"page", page,
			"cityAlias", cityAlias,
			"status", resp.Status,
			"body", string(body),
			"err", err,
		)
		return nil, fmt.Errorf("error fetching Filmstaden shows, got %s", resp.Status)
	}
	decoder := json.NewDecoder(resp.Body)
	shows := new(Shows)
	if err := decoder.Decode(shows); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Filmstaden shows: %w", err)
	}
	return shows, nil
}
