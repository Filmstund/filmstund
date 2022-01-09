package filmstaden

import (
	"context"
	"fmt"
)

type ScreenLayout struct {
	ID                         int    `json:"id"`
	LanguageID                 string `json:"languageId"`
	AuditoriumLayoutID         string `json:"auditoriumLayoutId"`
	DefaultLayout              bool   `json:"defaultLayout"`
	MaxVisitorsAllowed         int    `json:"maxVisitorsAllowed"`
	SocialDistanceBetweenSeats int    `json:"socialDistanceBetweenSeats"`
	Dimensions                 struct {
		Width  float64 `json:"width"`
		Height float64 `json:"height"`
	} `json:"dimensions"`
	Elements []struct {
		Name        string `json:"name"`
		Coordinates struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
		} `json:"coordinates"`
		Dimensions struct {
			Width  float64 `json:"width"`
			Height float64 `json:"height"`
		} `json:"dimensions"`
		ID      int       `json:"id"`
		Points  []float64 `json:"points"`
		Version int       `json:"version"`
	} `json:"elements"`
	Seats []struct {
		RemoteSystemAlias string `json:"remoteSystemAlias"`
		RemoteEntityID    string `json:"remoteEntityId"`
		Row               int    `json:"row"`
		Number            int    `json:"number"`
		SeatType          string `json:"seatType"`
		Coordinates       struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
		} `json:"coordinates"`
		Dimensions struct {
			Width  float64 `json:"width"`
			Height float64 `json:"height"`
		} `json:"dimensions"`
		LanguageID      string `json:"languageId"`
		RotationDegrees int    `json:"rotationDegrees"`
		Section         string `json:"section"`
		Side            string `json:"side"`
		SeatGroup       int    `json:"seatGroup"`
	} `json:"seats"`
}

// ScreenLayout fetches the layout of a particular screen. The layout ID can be found in SingleShow.auditoriumLayoutId.
// It also seems to be the third part of the show id, e.g. 1572 in 20220109-1700-1572.
func (client *Client) ScreenLayout(ctx context.Context, layoutID string) (*ScreenLayout, error) {
	url := fmt.Sprintf(
		"%s/screen/layout/sv/%s",
		client.baseURL,
		layoutID,
	)

	screenLayout := new(ScreenLayout)
	if err := client.decodedGet(ctx, url, screenLayout); err != nil {
		return nil, fmt.Errorf("screenLayout: %w", err)
	}
	return screenLayout, nil
}
