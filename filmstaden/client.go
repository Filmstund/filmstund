package filmstaden

import (
	"net/http"
	"time"
)

const (
	APIURL         = "https://www.filmstaden.se/api/v2"
	requestTimeout = 3 * time.Second
)

type Client struct {
	baseURL string
	http    *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		http: &http.Client{
			Timeout: requestTimeout,
		},
	}
}
