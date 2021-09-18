package database

import (
	"fmt"
	"net/url"
)

type Config struct {
	Database string `env:"DB_DATABASE, default=filmstund"`
	Username string `env:"DB_USERNAME, default=filmstund"`
	Password string `env:"DB_PASSWORD, default=filmstund" json:"-"`
	Hostname string `env:"DB_HOSTNAME, default=localhost"`
	Port     string `env:"DB_PORT, default=5432"`
	SslMode  string `env:"DB_SSL_MODE, default=disable"` // Possible values: disable, allow, prefer, require, verify-ca, verify-full
	// TODO: pool settings
}

func (c *Config) DatabaseConfig() *Config {
	return c
}

func (c *Config) ConnectionString() string {
	usernamePassword := url.UserPassword(c.Username, c.Password)

	// TODO: Maybe change to DSN format instead.
	return fmt.Sprintf(
		"postgresql://%s@%s:%s/%s?sslmode=%s",
		usernamePassword,
		c.Hostname,
		c.Port,
		c.Database,
		c.SslMode,
	)
}
