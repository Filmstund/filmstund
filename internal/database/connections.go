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

// Queries is a convenience func for getting a dao.Queries.
func (db *DB) Queries(ctx context.Context) *dao.Queries {
	return dao.New(db.Pool)
}

type (
	CommitFunc   func(ctx context.Context) error
	RollbackFunc func(ctx context.Context)
)

func (db *DB) TX(ctx context.Context) (q *dao.Queries, commit CommitFunc, rollback RollbackFunc, err error) {
	tx, err := db.Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, noopCommit, noopRollback, fmt.Errorf("failed to begin TX: %w", err)
	}
	return dao.New(tx), tx.Commit, logWrapper(tx.Rollback), nil
}

func noopCommit(ctx context.Context) error {
	return nil
}
func noopRollback(ctx context.Context) {}

func logWrapper(rollback func(ctx context.Context) error) RollbackFunc {
	return func(ctx context.Context) {
		if err := rollback(ctx); err != nil {
			logging.FromContext(ctx).Error(err, "transaction rollback failed")
		}
	}
}

func (db *DB) Close(ctx context.Context) {
	logging.FromContext(ctx).Info("closing database connection pool...")
	db.Pool.Close()
}
