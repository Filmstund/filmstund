package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *showingResolver) MyTickets(ctx context.Context, obj *model.Showing) ([]*model.Ticket, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) TicketRange(ctx context.Context, obj *model.Showing) (*model.TicketRange, error) {
	panic(fmt.Errorf("not implemented"))
}
