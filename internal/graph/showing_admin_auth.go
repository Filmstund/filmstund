package graph

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/99designs/gqlgen/graphql"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
)

// VerifyShowingAdmin is a GQL middleware that checks if the callee is a showing
// admin on the query/mutation being called using the "auth" GQL directive.
func VerifyShowingAdmin(ctx context.Context, _ interface{}, next graphql.Resolver, role model.Role) (res interface{}, err error) {
	if role != model.RoleShowingAdmin {
		return next(ctx)
	}

	fieldCtx := graphql.GetFieldContext(ctx)
	prin := principal.FromContext(ctx)
	if showingID, ok := extractShowingID(fieldCtx); ok {
		q := database.FromContext(ctx)
		if ok, err := q.AdminOnShowing(ctx, dao.AdminOnShowingParams{
			AdminUserID: prin.ID,
			ShowingID:   showingID,
		}); ok && err == nil {
			return next(ctx)
		}
	}
	logging.FromContext(ctx).
		Info("attempted query/mutation without being a showing admin",
			"userID", prin.ID,
			"operation", fieldCtx.Field.Name,
		)
	return nil, fmt.Errorf("you must be a showing admin for this")
}

func extractShowingID(fctx *graphql.FieldContext) (uuid.UUID, bool) {
	if showingID, ok := fctx.Args["showingID"]; ok {
		showingID, ok := showingID.(uuid.UUID)
		return showingID, ok
	}
	return uuid.Nil, false
}
