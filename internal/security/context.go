package security

import (
	"context"

	"github.com/golang-jwt/jwt/v4"
)

type contextKey string

const key = contextKey("jwt-token")

// WithToken affixes token to ctx, given that token is not nil.
func WithToken(ctx context.Context, token *jwt.Token) context.Context {
	if token == nil {
		return ctx
	}

	return context.WithValue(ctx, key, token)
}

// FromContext extracts a token or nil if none was found.
func FromContext(ctx context.Context) *jwt.Token {
	if token, ok := ctx.Value(key).(*jwt.Token); ok {
		return token
	}
	// TODO: what can we replace this with?
	return nil
}
