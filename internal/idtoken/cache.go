package idtoken

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/benbjohnson/clock"
	"github.com/filmstund/filmstund/internal/logging"
)

type Config struct {
	DefaultCacheSize int           `env:"TOKEN_DEFAULT_CACHE_SIZE,default=20"`
	ExpiryInterval   time.Duration `env:"TOKEN_EXPIRY_INTERVAL,default=7s"`
}

type cachedUser struct {
	expireAt time.Time
	idToken  *IDToken
}

func (cu *cachedUser) String() string {
	return fmt.Sprintf("{expires: %s, subject: %s}", cu.expireAt, cu.idToken.Sub)
}

type Cache struct {
	cfg                Config
	tokens             map[Subject]cachedUser // the key is the subject (sub) from the token.
	stopExpirationFunc context.CancelFunc
	clock              clock.Clock
	mu                 sync.RWMutex
}

type MappingFunc func() (*IDToken, time.Time)

func NewCache(cfg Config) *Cache {
	return newWithClock(cfg, clock.New())
}

func newWithClock(cfg Config, clock clock.Clock) *Cache {
	c := &Cache{
		cfg:    cfg,
		tokens: make(map[Subject]cachedUser, cfg.DefaultCacheSize),
		clock:  clock,
		mu:     sync.RWMutex{},
	}

	return c
}

// Get returns the cached token if it exists and hasn't expired, else nil.
func (c *Cache) Get(sub Subject) *IDToken {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if token, ok := c.tokens[sub]; ok && token.expireAt.After(c.clock.Now()) {
		return token.idToken
	}
	return nil
}

func (c *Cache) GetOrSet(sub Subject, mappingFunc MappingFunc) *IDToken {
	if token := c.Get(sub); token != nil {
		return token
	}

	if mappingFunc == nil {
		return nil
	}

	// TODO: Check token has same subject?
	token, expireAt := mappingFunc()
	c.PutOrUpdate(token, expireAt)
	return token
}

// PutOrUpdate adds the token to the cache, or updates it if the expiry time is after
// the current expiry time.
func (c *Cache) PutOrUpdate(token *IDToken, expireAt time.Time) {
	c.mu.Lock()
	defer c.mu.Unlock()
	// TODO: check expiry?

	c.tokens[token.Sub] = cachedUser{
		expireAt: expireAt,
		idToken:  token,
	}
}

func (c *Cache) StartExpiration(ctx context.Context) {
	if c.stopExpirationFunc != nil {
		logging.FromContext(ctx).Warnw("token expiration already on-going")
		return
	}

	expiryCtx, cancelFunc := context.WithCancel(ctx)
	c.stopExpirationFunc = cancelFunc

	go c.expireTokens(expiryCtx)
}

func (c *Cache) expireTokens(ctx context.Context) {
	logger := logging.FromContext(ctx)

	logger.Debugw("running background token expiration", "interval", c.cfg.ExpiryInterval)
	ticker := c.clock.Ticker(c.cfg.ExpiryInterval)
	for {
		select {
		case <-ctx.Done():
			logger.Debugw("shutting down background token expiration...")
			return
		case triggerTime := <-ticker.C:
			if count := c.deleteExpiredTokens(); count > 0 {
				logger.Debugw("removed expired tokens",
					"duration", c.clock.Since(triggerTime),
					"expired", count,
					"not-expired", len(c.tokens),
				)
			}
		}
	}
}

func (c *Cache) deleteExpiredTokens() (deletedCount int) {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := c.clock.Now()
	for sub, item := range c.tokens {
		if item.expireAt.Before(now) {
			deletedCount++
			delete(c.tokens, sub)
		}
	}
	return deletedCount
}

func (c *Cache) StopBackgroundExpiration() {
	if c == nil || c.stopExpirationFunc == nil {
		return
	}

	c.stopExpirationFunc()
	c.stopExpirationFunc = nil
}
