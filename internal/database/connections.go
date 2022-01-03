package database

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/database/dao"
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

// Queries retrieves a connection from the DB pool, using it to create a queryable interface.
// Use func() to clean up and release the connection back to the pool.
func (db *DB) Queries(ctx context.Context) (q *dao.Queries, cleanup func(), err error) {
	conn, err := db.Pool.Acquire(ctx)
	if err != nil {
		return nil, noop, fmt.Errorf("failed to acquire db connection: %w", err)
	}

	queries := dao.New(conn)
	return queries, conn.Release, nil
}

type FinalizeFunc func(ctx context.Context) error

func (db *DB) TX(ctx context.Context) (q *dao.Queries, commit FinalizeFunc, rollback FinalizeFunc, err error) {
	tx, err := db.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, noopFinalize, noopFinalize, fmt.Errorf("failed to begin TX: %w", err)
	}
	return dao.New(tx), tx.Commit, tx.Rollback, nil
}

func noop() {}
func noopFinalize(ctx context.Context) error {
	return nil
}

func (db *DB) Close(ctx context.Context) {
	logging.FromContext(ctx).Info("closing database connection pool...")
	db.Pool.Close()
}
