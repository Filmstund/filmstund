package filmstaden

import (
	"context"
	"fmt"
)

func (client *Client) Barcode(ctx context.Context, ticketID string) (*string, error) {
	url := fmt.Sprintf(
		"%s/barcode/%s/128/128",
		client.baseURL,
		ticketID,
	)
	show := new(string)
	if err := client.decodedGet(ctx, url, show); err != nil {
		return nil, fmt.Errorf("barcode: %w", err)
	}
	return show, nil
}
