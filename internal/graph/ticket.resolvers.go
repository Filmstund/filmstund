package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *showingResolver) MyTickets(ctx context.Context, obj *model.Showing) ([]*model.Ticket, error) {
	prin := principal.FromContext(ctx)
	tickets, err := database.FromContext(ctx).MyTickets(ctx, dao.MyTicketsParams{
		ShowingID: obj.ID,
		UserID:    prin.ID,
	})
	if err != nil {
		logging.FromContext(ctx).Error(err, "query.MyTickets failed",
			"showingID", obj.ID,
			"userID", prin.ID,
		)
		return nil, fmt.Errorf("failed to fetch tickets for user and showing")
	}
	return dao.Tickets(tickets).GraphModel(), nil
}

func (r *showingResolver) TicketRange(ctx context.Context, obj *model.Showing) (*model.TicketRange, error) {
	// TODO: implement
	panic(fmt.Errorf("not implemented"))
}
