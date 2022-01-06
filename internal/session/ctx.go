package session

import "context"

type contextKey string

const sessionIDKey = contextKey("sessionID")

// FromContext returns the current session ID from the context if it exists.
// Returns ErrNoSession if no session is found.
func FromContext(ctx context.Context) (string, error) {
	value := ctx.Value(sessionIDKey)
	if str, ok := value.(*string); ok {
		return *str, nil
	}
	return "", ErrNoSession
}

// WithSessionID puts the given session ID into the given context, returning a new one.
func WithSessionID(parent context.Context, sessionID string) context.Context {
	return context.WithValue(parent, sessionIDKey, &sessionID)
}
