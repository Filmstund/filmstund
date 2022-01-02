package filmstaden

import (
	"net/http"
	"time"
)

const (
	APIURL           = "https://www.filmstaden.se/api/v2"
	requestTimeout   = 3 * time.Second
	defaultUserAgent = "Mozilla/5.0 (Linux; Android 11; Pixel 3 XL Build/RQ1A.210205.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/87.0.4280.141 Mobile Safari/537.36"
)

type Client struct {
	baseURL string
	http    *http.Client
}

func NewClient(baseURL string) *Client {
	transport := defaultHeaderTransport{
		roundTripper: http.DefaultTransport,
	}
	return &Client{
		baseURL: baseURL,
		http: &http.Client{
			Transport: &transport,
			Timeout:   requestTimeout,
		},
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
