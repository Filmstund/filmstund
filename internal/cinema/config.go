package cinema

import (
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/security/principal"
	"github.com/filmstund/filmstund/internal/setup"
)

// Assertion for making sure the config implements these interfaces.
var (
	_ setup.DatabaseConfigProvider       = (*Config)(nil)
	_ setup.SecurityConfigProvider       = (*Config)(nil)
	_ setup.PrincipalCacheConfigProvider = (*Config)(nil)
)

type Config struct {
	Database       database.Config
	Security       security.Config
	PrincipalCache principal.Config

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

func (c *Config) PrincipalCacheConfig() principal.Config {
	return c.PrincipalCache
}

func (c *Config) MaintenanceMode() bool {
	return c.Maintenance
}
