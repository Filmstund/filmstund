package cinema

import (
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/setup"
	"github.com/filmstund/filmstund/internal/site"
)

// Assertion for making sure the config implements these interfaces.
var (
	_ setup.DatabaseConfigProvider = (*Config)(nil)
	_ setup.SecurityConfigProvider = (*Config)(nil)
	_ site.ConfigProvider          = (*Config)(nil)
)

type Config struct {
	Database database.Config
	Security security.Config
	Site     site.Config

	ListenAddr  string `env:"LISTEN_ADDR,default=:8080"`
	ServePath   string `env:"SERVE_PATH,default=./web/build"`
	Maintenance bool   `env:"MAINTENANCE_MODE, default=false"`
}

func (c *Config) DatabaseConfig() *database.Config {
	return &c.Database
}

func (c *Config) SecurityConfig() *security.Config {
	return &c.Security
}

func (c *Config) SiteConfig() site.Config {
	return c.Site
}

func (c *Config) MaintenanceMode() bool {
	return c.Maintenance
}
