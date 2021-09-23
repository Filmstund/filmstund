package users

import (
	"context"
	"time"
)

type IDToken struct {
	Sub           string    `json:"sub"`
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

type idTokenKey string

const key = idTokenKey("id_token")

func WithIDToken(ctx context.Context, token *IDToken) context.Context {
	return context.WithValue(ctx, key, token)
}

func IDTokenFromContext(ctx context.Context) *IDToken {
	if idToken, ok := ctx.Value(key).(*IDToken); ok {
		return idToken
	}
	// TODO: what can we replace this with?
	return nil
}
