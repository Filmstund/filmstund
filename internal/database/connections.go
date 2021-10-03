package database

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database/sqlc"
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

type QueryFunc func(q *sqlc.Queries) error

// DoQuery retrieves a connection from the DB pool, and executes the
// given func with a sqlc.Queries.
func (db *DB) DoQuery(ctx context.Context, f QueryFunc) error {
	conn, err := db.Pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("failed to acquire db connection: %w", err)
	}
	defer conn.Release()

	queries := sqlc.New(conn)
	return f(queries)
}

func (db *DB) Close(ctx context.Context) {
	logging.FromContext(ctx).Infof("closing database connection pool...")
	db.Pool.Close()
}
