package session

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"net/http"

	"github.com/allegro/bigcache/v3"
	"github.com/eko/gocache/v2/cache"
	"github.com/eko/gocache/v2/store"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/google/uuid"
)

type Storage struct {
	cfg          Config
	cacheManager *cache.Cache
}

func NewStorage(cfg Config) (*Storage, error) {
	bigCache, err := bigcache.NewBigCache(bigcache.DefaultConfig(cfg.ExpirationTime))
	if err != nil {
		return nil, fmt.Errorf("failed to setup bigcache: %w", err)
	}

	cacheStore := store.NewBigcache(bigCache, nil)
	cacheManager := cache.New(cacheStore)

	return &Storage{
		cfg:          cfg,
		cacheManager: cacheManager,
	}, nil
}

func (s *Storage) Start(ctx context.Context, w http.ResponseWriter, prin principal.Principal) error {
	sessionID, err := uuid.NewRandom()
	if err != nil {
		return fmt.Errorf("failed to create session ID: %w", err)
	}

	if err := s.addToCache(ctx, sessionID, prin); err != nil {
		return fmt.Errorf("failed to put session into cache: %w", err)
	}

	sessionCookie := http.Cookie{
		Name:  s.cfg.CookieName,
		Value: sessionID.String(),
		Path:  "/",
		// MaxAge:   int(s.cfg.ExpirationTime.Seconds()), // TODO: only a "real" session cookie if there is no max-age
		Secure:   false, // TODO: true
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &sessionCookie)

	// TODO: log new session added and removed
	return nil
}

func (s *Storage) addToCache(ctx context.Context, sessionID uuid.UUID, prin principal.Principal) error {
	bb := new(bytes.Buffer)
	encoder := gob.NewEncoder(bb)
	if err := encoder.Encode(prin); err != nil {
		return fmt.Errorf("failed to encode to byte slice: %w", err)
	}

	return s.cacheManager.Set(ctx, sessionID.String(), bb.Bytes(), &store.Options{
		Expiration: s.cfg.ExpirationTime,
	})
}

func (s *Storage) Lookup(ctx context.Context, r *http.Request) (*principal.Principal, error) {
	sessionCookie, err := r.Cookie(s.cfg.CookieName)
	if err != nil {
		return nil, fmt.Errorf("no session found")
	}

	sessionID := sessionCookie.Value

	prin, err := s.getFromCache(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve session from cache: %w", err)
	}

	return prin, nil
}

func (s *Storage) getFromCache(ctx context.Context, sessionID string) (*principal.Principal, error) {
	cachedPrincipal, err := s.cacheManager.Get(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	prin := new(principal.Principal)
	buff := bytes.NewBuffer(cachedPrincipal.([]byte))
	err = gob.NewDecoder(buff).Decode(prin)

	return prin, err
}

func (s *Storage) Invalidate(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	sessionCookie, err := r.Cookie(s.cfg.CookieName)
	if err != nil {
		// No cookie == no session to invalidate
		//nolint:nilerr
		return nil
	}

	http.SetCookie(w, &http.Cookie{
		Name:   sessionCookie.Name,
		Domain: sessionCookie.Domain,
		Path:   sessionCookie.Path,
		MaxAge: -1,
	})

	return s.cacheManager.Delete(ctx, sessionCookie.Value)
}
