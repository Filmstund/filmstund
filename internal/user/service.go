package user

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/sqlc"
)

type Service struct {
	db *database.DB
}

func NewService(db *database.DB) *Service {
	return &Service{
		db: db,
	}
}

func (s *Service) Exists(ctx context.Context, sub principal.Subject) (bool, error) {
	var exists bool
	err := s.db.DoQuery(ctx, func(q *sqlc.Queries) error {
		found, err := q.UserExistsBySubject(ctx, sub.String())
		exists = found
		return err
	})
	if err != nil {
		return false, fmt.Errorf("failed to check for existence on %s: %w", sub, err)
	}
	return exists, nil
}
