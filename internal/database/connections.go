package database

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/logging"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

type DB struct {
	Pool *pgxpool.Pool
}

func New(ctx context.Context, cfg *Config) (*DB, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.ConnectionString())
	if err != nil {
		return nil, fmt.Errorf("incorrect database connection string: %w", err)
	}

	poolConfig.BeforeAcquire = func(ctx context.Context, conn *pgx.Conn) bool {
		// Make sure the connection is live before giving it away.
		return conn.Ping(ctx) == nil
	}

	pool, err := pgxpool.ConnectConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to initiate database connection pool: %w", err)
	}

	return &DB{
		Pool: pool,
	}, nil
}

func (d *DB) Close(ctx context.Context) {
	logging.FromContext(ctx).Infof("closing database connection pool...")
	d.Pool.Close()
}
