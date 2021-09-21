package security

import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"net/url"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/filmstund/filmstund/internal/logging"
)

type Config struct {
	Algorithm string `env:"JWT_EXPECTED_ALG, default=RS256"` // expected signing algorithm
	Audience  string `env:"JWT_EXPECTED_AUD, required"`      // expected audience (who, or what is the tokens intended for)
	Issuer    string `env:"JWT_EXPECTED_ISS, required"`      // the expected issuer (who created and signed our tokens)
	JwksURL   string `env:"JWT_JWKS_URL, default=${JWT_EXPECTED_ISS}.well-known/jwks.json"`
	// TODO client secret etc?

	jwks     *keyfunc.JWKs
	jwksOnce sync.Once
}

func (c *Config) SecurityConfig() *Config {
	return c
}

// JWKs returns the downloaded JWKS. It will download it if needed,
// and keep refreshing it in the background on a set interval.
func (c *Config) JWKs(ctx context.Context) *keyfunc.JWKs {
	// Panic if the URL isn't valid. No need to query for the JWKS indefinitely
	if _, err := url.ParseRequestURI(c.JwksURL); err != nil {
		panic(fmt.Errorf("URL to JWKS is invalid: %w", err))
	}

	c.jwksOnce.Do(func() {
		c.jwks = fetchJwksUntilFound(ctx, c.JwksURL)
	})
	return c.jwks
}

// fetchJwksUntilFound will keep trying to download the JWKS if an errors occurs.
// It will only stop if the context is cancelled or a correct JWKS is downloaded.
func fetchJwksUntilFound(ctx context.Context, jwksURL string) *keyfunc.JWKs {
	logger := logging.FromContext(ctx)

	refreshUnknownKID := false // might want to have this as true, but probably not needed in most cases...
	refreshInterval := 48 * time.Hour
	refreshRateLimit := 7 * time.Minute
	errorHandler := func(err error) {
		logger.Warnw("failed to refresh JWKS", "err", err, "url", jwksURL)
	}

	attempt := 0
	ticker := time.NewTicker(exponentialBackoff(attempt))
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			logger.Debugf("context cancelled, bailing out without JWKS...")
			return nil
		case <-ticker.C:
			jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{
				Ctx:                 ctx,
				RefreshErrorHandler: errorHandler,
				RefreshInterval:     &refreshInterval,
				RefreshRateLimit:    &refreshRateLimit,
				RefreshUnknownKID:   &refreshUnknownKID,
			})
			if err != nil {
				attempt++
				ticker.Reset(exponentialBackoff(attempt))
				logger.Infow("failed to download JWKS", "url", jwksURL, "err", err, "attempt", attempt)
				continue
			}

			logger.Debugw("downloaded JWKs", "attempt", attempt, "url", jwksURL)
			return jwks
		}
	}
}

// exponentialBackoff returns an increasing duration based on the number of attempts. Caps out at 1min 30 sec.
func exponentialBackoff(n int) time.Duration {
	if n == 0 {
		return 10 * time.Millisecond
	}
	secondsToWait := time.Duration(math.Pow(2, float64(n))) * time.Second
	randomOffset := time.Duration(rand.Int63n(int64(time.Second))) //nolint:gosec    // random time between [0, 1sec)
	waitTime := secondsToWait + randomOffset
	const maxWaitTime = 90 * time.Second
	return min(waitTime, maxWaitTime)
}

func min(x, y time.Duration) time.Duration {
	if x < y {
		return x
	}
	return y
}
