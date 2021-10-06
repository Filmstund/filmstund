package auth0

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"sync"
	"time"

	"edholm.dev/go-logging"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/filmstund/filmstund/internal/httputils"
	"golang.org/x/oauth2"
)

func NewService(ctx context.Context, cfg *Config) (*Service, error) {
	// This is using the OpenID discovery protocol to figure out well known stuff.
	provider, err := oidc.NewProvider(ctx, cfg.Issuer)
	if err != nil {
		return nil, fmt.Errorf("failed to setup OpenID Connect provider: %w", err)
	}

	return &Service{
		oauthCfg: oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  cfg.LoginCallbackURL,
			Scopes:       cfg.Scopes,
		},
		verifier:  provider.Verifier(&oidc.Config{ClientID: cfg.ClientID}),
		cfg:       cfg,
		pkceCache: pkceCache{cache: make(map[string]pkceEntry, 10)},
	}, nil
}

type Service struct {
	oauthCfg oauth2.Config
	verifier *oidc.IDTokenVerifier

	cfg *Config

	pkceCache pkceCache
}

type (
	pkceCache struct {
		cache map[string]pkceEntry // keyed by the 'state'
		mu    sync.RWMutex
	}
	pkceEntry struct {
		codeVerifier string
		expiresAt    time.Time
	}
)

func (p *pkceCache) get(state string) (pkceEntry, bool) {
	p.invalidateOldEntries()
	p.mu.RLock()
	defer p.mu.RUnlock()
	pkce, itemFound := p.cache[state]
	return pkce, itemFound
}

func (p *pkceCache) add(state string, pkce pkceEntry) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.cache[state] = pkce
}

func (p *pkceCache) del(state string) {
	p.mu.Lock()
	defer p.mu.Unlock()
	delete(p.cache, state)
}

// invalidate old entries in the cache.
func (p *pkceCache) invalidateOldEntries() {
	p.mu.Lock()
	defer p.mu.Unlock()

	now := time.Now()
	for state, pkce := range p.cache {
		if pkce.expiresAt.Before(now) {
			delete(p.cache, state)
		}
	}
}

func newPkce() pkceEntry {
	return pkceEntry{
		codeVerifier: randBase64String(96),
		expiresAt:    time.Now().Add(10 * time.Minute),
	}
}

func (p *pkceEntry) createChallenge() string {
	sum := sha256.Sum256([]byte(p.codeVerifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func randBase64String(sizeInBytes int) string {
	resultingLen := 4 * (sizeInBytes / 3)
	if resultingLen < 43 { // rfc7636#section-4.1
		sizeInBytes = 33
	}
	if resultingLen > 128 {
		sizeInBytes = 96
	}

	buf := make([]byte, sizeInBytes)
	_, err := io.ReadFull(rand.Reader, buf)
	if err != nil {
		panic(fmt.Errorf("failed to generate random bytes: %w", err))
	}

	return base64.RawURLEncoding.EncodeToString(buf)
}

func setCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	kaka := http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int((5 * time.Minute).Seconds()),
		Secure:   r.TLS != nil,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // TODO: how to use strict?
	}
	http.SetCookie(w, &kaka)
}

func (s *Service) LoginHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		state := randBase64String(43)
		nonce := randBase64String(43)
		setCookie(w, r, "state", state)
		setCookie(w, r, "nonce", nonce)

		pkce := newPkce()
		s.pkceCache.add(state, pkce)

		authURL := s.oauthCfg.AuthCodeURL(
			state,
			oidc.Nonce(nonce),
			oauth2.SetAuthURLParam("audience", s.cfg.Audience), // not needed if default audience is configured in tenant
			oauth2.SetAuthURLParam("code_challenge", pkce.createChallenge()),
			oauth2.SetAuthURLParam("code_challenge_method", "S256"),
		)
		http.Redirect(w, r, authURL, http.StatusFound)
	})
}

//nolint:cyclop
func (s *Service) LoginCallbackHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := logging.FromContext(r.Context())

		state, err := r.Cookie("state")
		if err != nil {
			httputils.BadRequest(w, r, "state not found")
			return
		}

		if r.URL.Query().Get("state") != state.Value {
			httputils.BadRequest(w, r, "state doesn't match")
			return
		}

		if r.URL.Query().Get("error") != "" {
			httputils.BadRequest(w, r, r.URL.Query().Get("error_description"))
			return
		}

		pkce, matchFound := s.pkceCache.get(state.Value)
		if !matchFound {
			httputils.InternalServerError(w, r)
			logger.Warnw("failed to find pkce code_verifier", "err", err)
			return
		}
		s.pkceCache.del(state.Value)

		code := r.URL.Query().Get("code")
		token, err := s.oauthCfg.Exchange(r.Context(), code, oauth2.SetAuthURLParam("code_verifier", pkce.codeVerifier))
		if err != nil {
			httputils.InternalServerError(w, r)
			logger.Warnw("failed to exchange code for token", "err", err)
			return
		}

		rawIDToken, ok := token.Extra("id_token").(string)
		if !ok {
			httputils.InternalServerError(w, r)
			logger.Warnw("didn't get an ID token from the token exchange")
			return
		}

		scopes, ok := token.Extra("scope").(string)
		if !ok {
			httputils.InternalServerError(w, r)
			logger.Warnw("didn't get any scopes from the access token")
			return
		}

		idToken, err := s.verifier.Verify(r.Context(), rawIDToken)
		if err != nil {
			httputils.Unauthorized(w, r)
			logger.Infow("failed to verify ID token", "err", err)
		}

		nonce, err := r.Cookie("nonce")
		if err != nil {
			httputils.BadRequest(w, r, "nonce not found")
			return
		}
		if idToken.Nonce != nonce.Value {
			httputils.BadRequest(w, r, "wrong nonce")
			logger.Infow("nonce from cookie didn't match ID token nonce")
			return
		}

		resp := struct {
			OAuth2Token   *oauth2.Token
			IDTokenClaims *json.RawMessage // ID Token payload is just JSON.
			Scopes        string
		}{token, new(json.RawMessage), scopes}

		if err := idToken.Claims(&resp.IDTokenClaims); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		data, err := json.MarshalIndent(resp, "", "    ")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, _ = w.Write(data)
	})
}

func (s *Service) LogoutHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logoutURL, err := s.logoutURL()
		if err != nil {
			httputils.InternalServerError(w, r)
			logging.FromContext(r.Context()).Warnw("failed to create logout URL", "err", err)
			return
		}

		// TODO: invalidate local session state
		http.Redirect(w, r, logoutURL, http.StatusFound)
	})
}

func (s *Service) logoutURL() (string, error) {
	parsed, err := url.Parse(path.Join(s.cfg.Issuer, "/v2/logout"))
	if err != nil {
		return "", fmt.Errorf("failed to parse logout URL: %w", err)
	}

	q := parsed.Query()
	q.Add("client_id", s.cfg.ClientID)
	q.Add("returnTo", s.cfg.LogoutCallbackURL) // TODO: prodify.
	parsed.RawQuery = q.Encode()

	return parsed.String(), nil
}
