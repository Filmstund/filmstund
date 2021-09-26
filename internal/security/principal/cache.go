package principal

import (
	"context"
	"sync"
	"time"

	"github.com/benbjohnson/clock"
	"github.com/filmstund/filmstund/internal/logging"
)

type Config struct {
	DefaultCacheSize int           `env:"PRINCIPAL_DEFAULT_CACHE_SIZE,default=20"`
	ExpiryInterval   time.Duration `env:"PRINCIPAL_EXPIRY_INTERVAL,default=7s"`
}

type Cache struct {
	cfg                Config
	principals         map[Subject]*Principal
	stopExpirationFunc context.CancelFunc
	clock              clock.Clock
	mu                 sync.RWMutex
}

// MappingFunc returns a new principal to be put in the cache.
type MappingFunc func() *Principal

func NewCache(cfg Config) *Cache {
	return newWithClock(cfg, clock.New())
}

func newWithClock(cfg Config, clock clock.Clock) *Cache {
	c := &Cache{
		cfg:        cfg,
		principals: make(map[Subject]*Principal, cfg.DefaultCacheSize),
		clock:      clock,
		mu:         sync.RWMutex{},
	}

	return c
}

// Get returns the cached principal if it exists and hasn't expired, else nil.
func (c *Cache) Get(sub Subject) *Principal {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if p, ok := c.principals[sub]; ok && p.ExpiresAt.After(c.clock.Now()) {
		return p
	}
	return nil
}

func (c *Cache) GetOrSet(sub Subject, mappingFunc MappingFunc) *Principal {
	if prin := c.Get(sub); prin != nil {
		return prin
	}

	if mappingFunc == nil {
		return nil
	}

	// TODO: Check principal has same subject?
	p := mappingFunc()
	c.PutOrUpdate(p)
	return p
}

// PutOrUpdate adds the principal to the cache, or updates it if the expiry time is after
// the current expiry time.
func (c *Cache) PutOrUpdate(prin *Principal) {
	c.mu.Lock()
	defer c.mu.Unlock()
	// TODO: check expiry?

	c.principals[prin.Sub] = prin
}

func (c *Cache) StartExpiration(ctx context.Context) {
	if c.stopExpirationFunc != nil {
		logging.FromContext(ctx).Warnw("principal expiration already on-going")
		return
	}

	expiryCtx, cancelFunc := context.WithCancel(ctx)
	c.stopExpirationFunc = cancelFunc

	go c.expirePrincipals(expiryCtx)
}

func (c *Cache) expirePrincipals(ctx context.Context) {
	logger := logging.FromContext(ctx)

	logger.Debugw("running background principal expiration", "interval", c.cfg.ExpiryInterval)
	ticker := c.clock.Ticker(c.cfg.ExpiryInterval)
	for {
		select {
		case <-ctx.Done():
			logger.Debugw("shutting down background principal expiration...")
			return
		case triggerTime := <-ticker.C:
			if count := c.deleteExpiredPrincipals(); count > 0 {
				logger.Debugw("removed expired principals",
					"duration", c.clock.Since(triggerTime),
					"expired", count,
					"not-expired", len(c.principals),
				)
			}
		}
	}
}

func (c *Cache) deleteExpiredPrincipals() (deletedCount int) {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := c.clock.Now()
	for sub, p := range c.principals {
		if p.ExpiresAt.Before(now) {
			deletedCount++
			delete(c.principals, sub)
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
