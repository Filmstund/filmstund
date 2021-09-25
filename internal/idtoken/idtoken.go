package idtoken

import (
	"context"
	"time"
)

type Subject string

type IDToken struct {
	Sub           Subject   `json:"sub"`
	GivenName     string    `json:"given_name"`
	FamilyName    string    `json:"family_name"`
	Nickname      string    `json:"nickname"`
	Name          string    `json:"name"`
	Picture       string    `json:"picture"`
	Locale        string    `json:"locale"`
	UpdatedAt     time.Time `json:"updated_at"`
	Email         string    `json:"email"`
	EmailVerified bool      `json:"email_verified"`
}

func (t *IDToken) String() string {
	return string(t.Sub)
}

type idTokenKey string

const key = idTokenKey("id_token")

// WithIDToken attaches the token to the ctx.
func WithIDToken(ctx context.Context, token *IDToken) context.Context {
	return context.WithValue(ctx, key, token)
}

// FromContext retrieves the token from the ctx, returning nil if it doesn't exist.
func FromContext(ctx context.Context) *IDToken {
	if idToken, ok := ctx.Value(key).(*IDToken); ok {
		return idToken
	}
	// TODO: what can we replace this with? error?
	return nil
}
