package session

import "time"

type Config struct {
	ExpirationTime time.Duration `env:"SESSION_EXPIRATION_DURATION, default=48h"`
	CookieName     string        `env:"SESSION_COOKIE_NAME, default=data"`
}
