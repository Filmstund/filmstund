package auth0

import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"net/url"
	"sync"
	"time"

	"edholm.dev/go-logging"
	"github.com/MicahParks/keyfunc"
)

type Config struct {
	ClientID     string `env:"OIDC_CLIENT_ID, required"`
	ClientSecret string `env:"OIDC_CLIENT_SECRET, required" json:"-"`

	// The issuer of our tokens (who created and signed our tokens)
	Issuer string `env:"OIDC_ISSUER, required"`
	// Audience of the API we want to use (who, or what is the tokens intended for)
	Audience string `env:"OIDC_AUDIENCE, required"`
	// The scopes to request for our tokens
	Scopes []string `env:"OIDC_SCOPES, default=openid,profile,email,offline_access"`

	// Where should auth0 return users?
	LoginCallbackURL  string `env:"OIDC_LOGIN_CALLBACK_URL, default=http://local.filmstund.se:8080/login/callback"`
	LogoutCallbackURL string `env:"OIDC_LOGOUT_CALLBACK_URL, default=http://local.filmstund.se:8080/"`

	// TODO: remove
	Algorithm   string `env:"OIDC_EXPECTED_ALG, default=RS256"` // expected signing algorithm
	JWKsURL     string `env:"OIDC_JWKS_URL, default=${JWT_EXPECTED_ISS}.well-known/jwks.json"`
	UserinfoURL string `env:"OIDC_USERINFO_URL, default=${JWT_EXPECTED_ISS}userinfo"`

	jwks     *keyfunc.JWKs
	jwksOnce sync.Once
}

func (c *Config) Auth0Config() *Config {
	return c
}

// JWKs returns the downloaded JWKS. It will download it if needed,
// and keep refreshing it in the background on a set interval.
func (c *Config) JWKs(ctx context.Context) *keyfunc.JWKs {
	// Panic if the URL isn't valid. No need to query for the JWKS indefinitely
	if _, err := url.ParseRequestURI(c.JWKsURL); err != nil {
		panic(fmt.Errorf("URL to JWKS is invalid: %w", err))
	}

	c.jwksOnce.Do(func() {
		c.jwks = fetchJwksUntilFound(ctx, c.JWKsURL)
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
		logger.Info("failed to refresh JWKS", "err", err, "url", jwksURL)
	}

	attempt := 0
	ticker := time.NewTicker(exponentialBackoff(attempt))
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			logger.V(1).Info("context cancelled, bailing out without JWKS...")
			return nil
		case <-ticker.C:
			jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{
				Ctx:                 ctx,
				RefreshErrorHandler: errorHandler,
				RefreshInterval:     refreshInterval,
				RefreshRateLimit:    refreshRateLimit,
				RefreshUnknownKID:   &refreshUnknownKID,
			})
			if err != nil {
				attempt++
				ticker.Reset(exponentialBackoff(attempt))
				logger.Info("failed to download JWKS", "url", jwksURL, "err", err, "attempt", attempt)
				continue
			}

			logger.V(1).Info("downloaded JWKs", "attempt", attempt, "url", jwksURL)
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
