package principal

import (
	"context"
	"time"
)

type Subject string

type Principal struct {
	Sub        Subject   `json:"subject"`
	GivenName  string    `json:"givenName"`
	FamilyName string    `json:"familyName"`
	Nickname   string    `json:"nickname"`
	Picture    string    `json:"picture"`
	Email      string    `json:"email"`
	Scopes     []string  `json:"scopes"`
	UpdatedAt  time.Time `json:"updatedAt"`
	ExpiresAt  time.Time `json:"expiresAt"`
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

const key = contextKey("jwt-token")

// WithPrincipal affixes token to ctx, given that token is not nil.
func WithPrincipal(ctx context.Context, principal *Principal) context.Context {
	if principal == nil {
		return ctx
	}

	return context.WithValue(ctx, key, principal)
}

// FromContext extracts a token or nil if none was found.
func FromContext(ctx context.Context) *Principal {
	if token, ok := ctx.Value(key).(*Principal); ok {
		return token
	}
	// TODO: what can we replace this with?
	return nil
}
