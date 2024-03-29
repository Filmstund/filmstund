package principal

import (
	"context"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

type Subject string

func (s Subject) String() string {
	return string(s)
}

type Principal struct {
	ID        uuid.UUID     `json:"id"`
	Subject   Subject       `json:"subject"`
	Scopes    []string      `json:"scopes"`
	ExpiresAt time.Time     `json:"expiresAt"`
	Token     *oauth2.Token `json:"-"`
}

func (p *Principal) HasScope(scope string) bool {
	for _, s := range p.Scopes {
		if s == scope {
			return true
		}
	}
	return false
}

type contextKey string

const key = contextKey("principal")

// WithPrincipal affixes the principal to the ctx, given that the principal is not nil.
func WithPrincipal(ctx context.Context, principal *Principal) context.Context {
	if principal == nil {
		return ctx
	}

	return context.WithValue(ctx, key, principal)
}

// FromContext extracts a principal or nil if none was found.
func FromContext(ctx context.Context) *Principal {
	if prin, ok := ctx.Value(key).(*Principal); ok {
		return prin
	}

	panic("no principal stored in the context")
}
