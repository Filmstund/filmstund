package user

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
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
	q, cleanup, err := s.db.Queries(ctx)
	if err != nil {
		return false, fmt.Errorf("Exists: %w", err)
	}
	defer cleanup()

	exists, err := q.UserExistsBySubject(ctx, sub.String())
	if err != nil {
		return false, fmt.Errorf("failed to check for existence on %s: %w", sub, err)
	}
	return exists, nil
}
