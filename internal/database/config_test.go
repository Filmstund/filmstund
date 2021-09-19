package database

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/sethvargo/go-envconfig"
	"gotest.tools/assert"
)

func TestConfig_PGXConnectionString(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		cfg  *Config
		want string
	}{
		{
			name: "nil",
			cfg:  nil,
			want: "", // not really valid...
		},
		{
			name: "Blank config",
			cfg:  &Config{},
			want: "pgx://filmstund:filmstund@localhost:5432/filmstund?sslmode=prefer", // default config
		},
		{
			name: "Normal config",
			cfg: &Config{
				Hostname: "localhost",
				Port:     5432,
				Database: "filmstund",
				Username: "myuser",
				Password: "mypass",
				SslMode:  "disable",
			},
			want: "pgx://myuser:mypass@localhost:5432/filmstund?sslmode=disable",
		},
		{
			name: "Only host",
			cfg: &Config{
				Hostname: "custom.example.org",
			},
			want: "pgx://filmstund:filmstund@custom.example.org:5432/filmstund?sslmode=prefer", // default config
		},
		{
			name: "Full config",
			cfg: &Config{
				Hostname:              "localhost",
				Port:                  5432,
				Database:              "filmstund",
				Username:              "myuser",
				Password:              "mypass",
				SslMode:               "disable",
				ConnectTimeout:        60,
				PoolMinConnections:    1,
				PoolMaxConnections:    2,
				PoolMaxConnLifetime:   3,
				PoolMaxConnIdleTime:   4,
				PoolHealthCheckPeriod: 5,
			},
			want: "pgx://myuser:mypass@localhost:5432/filmstund?connect_timeout=60&sslmode=disable",
		},
		{
			name: "Special chars in password",
			cfg: &Config{
				Hostname: "localhost",
				Port:     1025,
				Database: "filmstund",
				Username: "apabepa",
				Password: "!\"#€%&",
			},
			want: "pgx://apabepa:%21%22%23%E2%82%AC%25&@localhost:1025/filmstund?sslmode=prefer",
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if tt.cfg != nil {
				err := envconfig.ProcessWith(context.TODO(), tt.cfg, envconfig.MapLookuper(nil))
				assert.NilError(t, err)
			}

			assert.Equal(t, tt.cfg.PGXConnectionString(), tt.want)
		})
	}
}

func Test_joinTogether(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		args map[string]string
		want string
	}{
		{
			name: "nil",
			args: nil,
			want: "",
		},
		{
			name: "Empty",
			args: map[string]string{},
			want: "",
		},
		{
			name: "Single value",
			args: map[string]string{"apa": "bepa"},
			want: "apa=bepa",
		},
		{
			name: "Multiple values",
			args: map[string]string{
				"apa": "bepa",
				"2nd": "value",
			},
			want: "apa=bepa 2nd=value",
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := joinTogether(tt.args)

			spaceCount := strings.Count(got, " ")
			wantCount := len(tt.args) - 1
			if wantCount >= 0 {
				assert.Equal(t, spaceCount, wantCount, "amount of spaces")
			}

			for key, val := range tt.args {
				keyval := fmt.Sprintf("%s=%s", key, val)
				if !strings.Contains(got, keyval) {
					t.Fatalf("expected to contain %s, got %s", keyval, got)
				}
			}
		})
	}
}

func TestConfig_dsnMap(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		cfg  *Config
		want map[string]string
	}{
		{
			name: "nil",
			cfg:  nil,
			want: nil,
		},
		{
			name: "default",
			cfg:  &Config{},
			want: map[string]string{
				"user":     "filmstund",
				"password": "filmstund",
				"host":     "localhost",
				"port":     "5432",
				"dbname":   "filmstund",
				"sslmode":  "prefer",
			},
		},
		{
			name: "override default",
			cfg: &Config{
				Hostname: "hostname",
				Port:     1234,
				Database: "dbname",
				Username: "username",
				Password: "password",
				SslMode:  "apabepa",
			},
			want: map[string]string{
				"user":     "username",
				"password": "password",
				"host":     "hostname",
				"port":     "1234",
				"dbname":   "dbname",
				"sslmode":  "apabepa",
			},
		},
		{
			name: "override default",
			cfg: &Config{
				Hostname:              "hostname",
				Port:                  1234,
				Database:              "dbname",
				Username:              "username",
				Password:              "password",
				SslMode:               "apabepa",
				ConnectTimeout:        1,
				PoolMinConnections:    2,
				PoolMaxConnections:    3,
				PoolMaxConnLifetime:   4,
				PoolMaxConnIdleTime:   5,
				PoolHealthCheckPeriod: 6,
			},
			want: map[string]string{
				"user":                     "username",
				"password":                 "password",
				"host":                     "hostname",
				"port":                     "1234",
				"dbname":                   "dbname",
				"sslmode":                  "apabepa",
				"connect_timeout":          "1",
				"pool_min_conns":           "2",
				"pool_max_conns":           "3",
				"pool_max_conn_lifetime":   "4ns",
				"pool_max_conn_idle_time":  "5ns",
				"pool_health_check_period": "6ns",
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if tt.cfg != nil {
				err := envconfig.ProcessWith(context.TODO(), tt.cfg, envconfig.MapLookuper(nil))
				assert.NilError(t, err)
			}

			assert.DeepEqual(t, tt.cfg.dsnMap(), tt.want)
		})
	}
}

func TestConfig_overrides(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		env  map[string]string
		want Config
	}{
		{
			name: "Default",
			env:  nil,
			want: Config{
				Hostname: "localhost",
				Port:     5432,
				Database: "filmstund",
				Username: "filmstund",
				Password: "filmstund",
				SslMode:  "prefer",
			},
		},
		{
			name: "Override default",
			env: map[string]string{
				"DB_HOSTNAME":                 "overridden_host",
				"DB_PORT":                     "2345",
				"DB_DATABASE":                 "overridden_db",
				"DB_USERNAME":                 "overridden_user",
				"DB_PASSWORD":                 "overridden_pass",
				"DB_SSL_MODE":                 "overridden_ssl",
				"DB_POOL_MIN_CONNS":           "1",
				"DB_POOL_MAX_CONNS":           "2",
				"DB_POOL_MAX_CONN_LIFETIME":   "10s",
				"DB_POOL_MAX_CONN_IDLE_TIME":  "20s",
				"DB_POOL_HEALTH_CHECK_PERIOD": "30s",
			},
			want: Config{
				Hostname:              "overridden_host",
				Port:                  2345,
				Database:              "overridden_db",
				Username:              "overridden_user",
				Password:              "overridden_pass",
				SslMode:               "overridden_ssl",
				PoolMinConnections:    1,
				PoolMaxConnections:    2,
				PoolMaxConnLifetime:   10 * time.Second,
				PoolMaxConnIdleTime:   20 * time.Second,
				PoolHealthCheckPeriod: 30 * time.Second,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var got Config
			err := envconfig.ProcessWith(context.TODO(), &got, envconfig.MapLookuper(tt.env))
			assert.NilError(t, err)

			assert.DeepEqual(t, got, tt.want)
		})
	}
}
