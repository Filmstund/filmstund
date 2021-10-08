package cinema

import (
	"github.com/filmstund/filmstund/internal/auth0"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/session"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/filmstund/filmstund/internal/site"
)

// Assertion for making sure the config implements these interfaces.
var (
	_ setup.DatabaseConfigProvider = (*Config)(nil)
	_ site.ConfigProvider          = (*Config)(nil)
	_ setup.SessionConfigProvider  = (*Config)(nil)
)

type Config struct {
	Database database.Config
	Security auth0.Config
	Site     site.Config
	Session  session.Config

	ListenAddr  string `env:"LISTEN_ADDR,default=:8080"`
	ServePath   string `env:"SERVE_PATH,default=./web/build"`
	Maintenance bool   `env:"MAINTENANCE_MODE, default=false"`
}

func (c *Config) DatabaseConfig() *database.Config {
	return &c.Database
}

func (c *Config) Auth0Config() *auth0.Config {
	return &c.Security
}

func (c *Config) SiteConfig() site.Config {
	return c.Site
}

func (c *Config) SessionConfig() session.Config {
	return c.Session
}

func (c *Config) MaintenanceMode() bool {
	return c.Maintenance
}
