package database

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Hostname       string `env:"DB_HOSTNAME, default=localhost"`
	Port           int    `env:"DB_PORT, default=5432"`
	Database       string `env:"DB_DATABASE, default=filmstund"`
	Username       string `env:"DB_USERNAME, default=filmstund"`
	Password       string `env:"DB_PASSWORD, default=filmstund" json:"-"`
	SslMode        string `env:"DB_SSL_MODE, default=prefer"` // Possible values: disable, allow, prefer, require, verify-ca, verify-full
	ConnectTimeout int    `env:"DB_CONNECT_TIMEOUT" json:",omitempty"`

	PoolMinConnections    int           `env:"DB_POOL_MIN_CONNS" json:",omitempty"`
	PoolMaxConnections    int           `env:"DB_POOL_MAX_CONNS" json:",omitempty"`
	PoolMaxConnLifetime   time.Duration `env:"DB_POOL_MAX_CONN_LIFETIME" json:",omitempty"`
	PoolMaxConnIdleTime   time.Duration `env:"DB_POOL_MAX_CONN_IDLE_TIME" json:",omitempty"`
	PoolHealthCheckPeriod time.Duration `env:"DB_POOL_HEALTH_CHECK_PERIOD" json:",omitempty"`
}

func (c *Config) DatabaseConfig() *Config {
	return c
}

// ConnectionString parses the config as a data source name (DSN),
// e.g. user=jack password=secret host=pg.example.com port=5432 dbname=mydb sslmode=verify-ca pool_max_conns=10.
func (c *Config) ConnectionString() string {
	return joinTogether(c.dsnMap())
}

// PGXConnectionString parses the config as a pgx connection string, e.g. pgx://user:password@host:port/dbname?query
// The intended use here is migrations, that doesn't seem to like the DSN format.
func (c *Config) PGXConnectionString() string {
	if c == nil {
		return ""
	}

	userInfo := url.UserPassword(c.Username, c.Password)
	hostPort := fmt.Sprintf("%s:%d", c.Hostname, c.Port)

	u := url.URL{
		Scheme: "pgx",
		User:   userInfo,
		Host:   hostPort,
		Path:   c.Database,
	}

	q := u.Query()
	if c.SslMode != "" {
		q.Set("sslmode", c.SslMode)
	}
	if c.ConnectTimeout > 0 {
		q.Set("connect_timeout", strconv.Itoa(c.ConnectTimeout))
	}
	u.RawQuery = q.Encode()

	return u.String()
}

// dsnMap converts the configuration to key value pairs appropriate for a data source name (DSN).
func (c *Config) dsnMap() map[string]string {
	if c == nil {
		return nil
	}

	dsn := make(map[string]string, 12)
	setUnlessBlank := func(key, val string) {
		if strings.TrimSpace(val) != "" {
			dsn[key] = val
		}
	}
	setIfPositive := func(key string, val int) {
		if val > 0 {
			dsn[key] = strconv.Itoa(val)
		}
	}
	setIfPositiveDur := func(key string, val time.Duration) {
		if val > 0 {
			dsn[key] = val.String()
		}
	}

	setUnlessBlank("user", c.Username)
	setUnlessBlank("password", c.Password)
	setUnlessBlank("host", c.Hostname)
	setIfPositive("port", c.Port)
	setUnlessBlank("dbname", c.Database)
	setUnlessBlank("sslmode", c.SslMode)
	setIfPositive("connect_timeout", c.ConnectTimeout)

	setIfPositive("pool_min_conns", c.PoolMinConnections)
	setIfPositive("pool_max_conns", c.PoolMaxConnections)
	setIfPositiveDur("pool_max_conn_lifetime", c.PoolMaxConnLifetime)
	setIfPositiveDur("pool_max_conn_idle_time", c.PoolMaxConnIdleTime)
	setIfPositiveDur("pool_health_check_period", c.PoolHealthCheckPeriod)

	return dsn
}

// joinTogether uses space to join the given map, e.g. "apa=bepa, cepa=depa".
func joinTogether(dsn map[string]string) string {
	values := make([]string, 0, len(dsn))
	for key, val := range dsn {
		keyval := fmt.Sprintf("%s=%s", key, val)
		values = append(values, keyval)
	}
	return strings.Join(values, " ")
}
