package session

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"net/http"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

type Client struct {
	cfg   Config
	db    *database.DB
	redis *redis.Client
}

func NewClient(cfgProvider ConfigProvider, servEnv *serverenv.ServerEnv) (*Client, error) {
	cfg := cfgProvider.SessionConfig()
	return &Client{
		cfg:   cfg,
		db:    servEnv.Database(),
		redis: servEnv.Redis(),
	}, nil
}

func (s *Client) Start(ctx context.Context, w http.ResponseWriter, prin principal.Principal) error {
	sessionID, err := uuid.NewRandom()
	if err != nil {
		return fmt.Errorf("failed to create session ID: %w", err)
	}

	if err := s.addToDatabase(ctx, sessionID, prin); err != nil {
		return fmt.Errorf("failed to add session to database: %w", err)
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

func (s *Client) addToCache(ctx context.Context, sessionID uuid.UUID, prin principal.Principal) error {
	marshaled, err := marshalPrincipal(prin)
	if err != nil {
		return err
	}

	return s.redis.Set(ctx, sessionID.String(), marshaled, s.cfg.ExpirationTime).Err()
}

func (s *Client) addToDatabase(ctx context.Context, sessionID uuid.UUID, prin principal.Principal) error {
	marshaled, err := marshalPrincipal(prin)
	if err != nil {
		return err
	}
	queries, cleanup, err := s.db.Queries(ctx)
	if err != nil {
		return fmt.Errorf("faild to accuire query interface: %w", err)
	}
	defer cleanup()
	if err := queries.AddSession(ctx, dao.AddSessionParams{
		ID:           sessionID,
		UserID:       prin.ID,
		RefreshToken: prin.Token.RefreshToken,
		Principal:    marshaled,
	}); err != nil {
		return fmt.Errorf("failed to add session to DB: %w", err)
	}
	return nil
}

// Lookup the principal based on the session cookie. Lookup will either be from
// the local in-mem cache, or from the database.
// TODO: refresh the principal id token maybe?.
func (s *Client) Lookup(ctx context.Context, r *http.Request) (*principal.Principal, error) {
	sessionCookie, err := r.Cookie(s.cfg.CookieName)
	if err != nil {
		return nil, fmt.Errorf("no session found")
	}
	sessionID := sessionCookie.Value
	prin, err := s.getFromCache(ctx, sessionID)
	if err != nil {
		session, err := s.getFromDatabase(ctx, sessionID)
		if err != nil {
			return nil, fmt.Errorf("failed to lookup session from cache or db: %w", err)
		}
		prin, err = unmarshalPrincipal(session.Principal)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal principal from DB: %w", err)
		}
		if err := s.addToCache(ctx, uuid.MustParse(sessionID), *prin); err != nil {
			logging.FromContext(ctx).Error(err, "failed to put principal into cache")
		}
	}
	// TODO: check principal token expiry time and refresh it if needed. (maybe not in this func though..)
	return prin, nil
}

func (s *Client) getFromCache(ctx context.Context, sessionID string) (*principal.Principal, error) {
	cachedPrincipal, err := s.redis.Get(ctx, sessionID).Result()
	if err != nil {
		return nil, err
	}

	prin, err := unmarshalPrincipal([]byte(cachedPrincipal))
	if err != nil {
		return nil, err
	}

	// Extend life of session on successful lookup
	if err := s.redis.Expire(ctx, sessionID, s.cfg.ExpirationTime).Err(); err != nil {
		return nil, fmt.Errorf("failed to update session with new expiration: %w", err)
	}

	return prin, nil
}

func (s *Client) getFromDatabase(ctx context.Context, sessionID string) (dao.Session, error) {
	queries, cleanup, err := s.db.Queries(ctx)
	if err != nil {
		return dao.Session{}, fmt.Errorf("failed to setup query interface: %w", err)
	}
	defer cleanup()
	session, err := queries.GetSession(ctx, uuid.MustParse(sessionID))
	if err != nil {
		return dao.Session{}, fmt.Errorf("failed to fetch session from DB: %w", err)
	}
	if time.Now().After(session.ExpirationDate) {
		if err := queries.DeleteSession(ctx, uuid.MustParse(sessionID)); err != nil {
			logging.FromContext(ctx).Error(err, "failed to delete session", "sessionID", sessionID)
		}
		return dao.Session{}, fmt.Errorf("session has expired")
	}
	return session, nil
}

func (s *Client) Invalidate(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
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

	return s.redis.Del(ctx, sessionCookie.Value).Err()
}

func marshalPrincipal(prin principal.Principal) ([]byte, error) {
	bb := new(bytes.Buffer)
	encoder := gob.NewEncoder(bb)
	if err := encoder.Encode(prin); err != nil {
		return nil, fmt.Errorf("failed to encode to byte slice: %w", err)
	}
	return bb.Bytes(), nil
}

func unmarshalPrincipal(cachedPrincipal []byte) (*principal.Principal, error) {
	prin := new(principal.Principal)
	buff := bytes.NewBuffer(cachedPrincipal)
	if err := gob.NewDecoder(buff).Decode(prin); err != nil {
		return nil, fmt.Errorf("failed to unmarshal principal: %w", err)
	}
	return prin, nil
}
