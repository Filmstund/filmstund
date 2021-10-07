package codeflow

import (
	"crypto/sha256"
	"encoding/base64"
	"sync"
	"time"

	"github.com/filmstund/filmstund/internal/security"
)

type (
	PkceCache struct {
		cache map[State]pkceEntry // keyed by the 'state' // TODO: switch to gocache
		mu    sync.RWMutex
	}
	pkceEntry struct {
		codeVerifier CodeVerifier
		expiresAt    time.Time
	}
)

type State string

func (s State) String() string {
	return string(s)
}

// NewPkceCache creates a new cache instance.
func NewPkceCache() *PkceCache {
	return &PkceCache{
		cache: map[State]pkceEntry{},
		mu:    sync.RWMutex{},
	}
}

// Get the code verifier for the state.
func (p *PkceCache) Get(state State) (CodeVerifier, bool) {
	p.invalidateOldEntries()
	p.mu.RLock()
	defer p.mu.RUnlock()
	pkce, itemFound := p.cache[state]
	return pkce.codeVerifier, itemFound
}

// Add code verifier for the given state.
func (p *PkceCache) Add(state State, codeVerifier CodeVerifier) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.cache[state] = pkceEntry{
		codeVerifier: codeVerifier,
		expiresAt:    time.Now().Add(10 * time.Minute),
	}
}

// Del removes the code verifier for the given state.
func (p *PkceCache) Del(state State) {
	p.mu.Lock()
	defer p.mu.Unlock()
	delete(p.cache, state)
}

// invalidate old entries in the cache.
func (p *PkceCache) invalidateOldEntries() {
	p.mu.Lock()
	defer p.mu.Unlock()

	now := time.Now()
	for state, pkce := range p.cache {
		if pkce.expiresAt.Before(now) {
			delete(p.cache, state)
		}
	}
}

type CodeVerifier string

// NewCodeVerifier creates a new random 128 char code verifier.
func NewCodeVerifier() CodeVerifier {
	return CodeVerifier(security.RandBase64String(96))
}

// CreateChallenge creates a challenge from this code verifier.
func (p *CodeVerifier) CreateChallenge() string {
	sum := sha256.Sum256([]byte(*p))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}
