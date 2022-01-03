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

const (
	APIURL           = "https://www.filmstaden.se/api/v2"
	requestTimeout   = 10 * time.Second
	defaultUserAgent = "Mozilla/5.0 (Linux; Android 11; Pixel 3 XL Build/RQ1A.210205.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/87.0.4280.141 Mobile Safari/537.36"
)

type Client struct {
	baseURL string
	http    *http.Client
	cache   QueryCache
}

func NewClient(baseURL string, cache QueryCache) *Client {
	transport := defaultHeaderTransport{
		roundTripper: http.DefaultTransport,
	}
	return &Client{
		baseURL: baseURL,
		http: &http.Client{
			Transport: &transport,
			Timeout:   requestTimeout,
		},
		cache: cache,
	}
}

type defaultHeaderTransport struct {
	roundTripper http.RoundTripper
}

func (transport *defaultHeaderTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Add("User-Agent", defaultUserAgent)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("X-Requested-With", "se.sfbio.mobile.android")
	return transport.roundTripper.RoundTrip(req)
}

func (client *Client) decodedGet(ctx context.Context, url string, target interface{}) error {
	logger := logging.FromContext(ctx).
		WithValues("url", url)
	timeout, cancelFunc := context.WithTimeout(ctx, requestTimeout)
	defer cancelFunc()

	req, err := http.NewRequestWithContext(timeout, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("failed to setup request: %w", err)
	}

	logger.V(2).Info("requesting Filmstaden data")
	resp, err := client.http.Do(req)
	if err != nil {
		return fmt.Errorf("failed to request Filmstaden data: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		logger.Info("failed to fetch Filmstaden data",
			"status", resp.Status,
			"body", string(body),
			"err", err,
		)
		return fmt.Errorf("error fetching Filmstaden data, got %s", resp.Status)
	}

	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(target); err != nil {
		return fmt.Errorf("failed to decode Filmstaden data: %w", err)
	}
	return nil
}
