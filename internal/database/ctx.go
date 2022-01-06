package database

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/database/dao"
)

type contextKey string

const queriesKey = contextKey("dbQueries")

func WithContext(ctx context.Context, queries *dao.Queries) context.Context {
	return context.WithValue(ctx, queriesKey, queries)
}

func FromContext(ctx context.Context) *dao.Queries {
	value := ctx.Value(queriesKey)
	if q, ok := value.(*dao.Queries); ok {
		return q
	}
	panic(fmt.Errorf("no query interface stored in context"))
}
