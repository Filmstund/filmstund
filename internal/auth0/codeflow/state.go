package codeflow

import (
	"crypto/sha256"
	"encoding/base64"
	"sync"
	"time"

	"github.com/filmstund/filmstund/internal/security"
)

type (
	stateCache struct {
		cache map[State]verification // TODO: switch to gocache?
		mu    sync.RWMutex
	}

	verification struct {
		nonce        Nonce
		codeVerifier CodeVerifier
		expiresAt    time.Time
	}

	State        string
	CodeVerifier string
	Nonce        string
)

// newPkceCache creates a new cache instance.
func newPkceCache() *stateCache {
	return &stateCache{
		cache: map[State]verification{},
		mu:    sync.RWMutex{},
	}
}

// Get the code verifier for the state.
func (p *stateCache) Get(state State) (Nonce, CodeVerifier, bool) {
	p.invalidateOldEntries()
	p.mu.RLock()
	defer p.mu.RUnlock()
	pkce, itemFound := p.cache[state]
	return pkce.nonce, pkce.codeVerifier, itemFound
}

// Add code verifier for the given state.
func (p *stateCache) Add(state State, nonce Nonce, codeVerifier CodeVerifier) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.cache[state] = verification{
		nonce:        nonce,
		codeVerifier: codeVerifier,
		expiresAt:    time.Now().Add(10 * time.Minute),
	}
}

// Del removes the code verifier for the given state.
func (p *stateCache) Del(state State) {
	p.mu.Lock()
	defer p.mu.Unlock()
	delete(p.cache, state)
}

// invalidate old entries in the cache.
func (p *stateCache) invalidateOldEntries() {
	p.mu.Lock()
	defer p.mu.Unlock()

	now := time.Now()
	for state, pkce := range p.cache {
		if pkce.expiresAt.Before(now) {
			delete(p.cache, state)
		}
	}
}

// NewCodeVerifier creates a new random 128 char code verifier.
func NewCodeVerifier() CodeVerifier {
	return CodeVerifier(security.RandBase64String(96))
}

// CreateChallenge creates a challenge from this code verifier.
func (cv *CodeVerifier) CreateChallenge() string {
	sum := sha256.Sum256([]byte(*cv))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func (s State) String() string {
	return string(s)
}

func (cv CodeVerifier) String() string {
	return string(cv)
}

func (n Nonce) String() string {
	return string(n)
}
