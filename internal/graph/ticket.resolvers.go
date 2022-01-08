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
	"github.com/google/uuid"
)

func (r *mutationResolver) ProcessTicketUrls(ctx context.Context, showingID uuid.UUID, ticketUrls []string) (*model.Showing, error) {
	for _, url := range ticketUrls {
		// TODO: check that all tickets are for the same show
		if !validateTicketURL(ctx, url) {
			return nil, fmt.Errorf("invalid format for the ticket URL. Example: https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/20211220-1810-1047/5BZZVDHC9SNS")
		}
	}
	if len(ticketUrls) == 0 {
		return r.Query().Showing(ctx, &showingID, nil)
	}

	logger := logging.FromContext(ctx).
		WithValues("showingID", showingID)
	ctx = logging.WithLogger(ctx, logger)

	tx, commit, rollback, err := r.db.TX(ctx)
	if err != nil {
		logger.Error(err, "failed to setup database transaction")
		return nil, errInternalServerError
	}

	// Update the showing to match downloaded FS ticket information.
	if err := r.updateShowingToMatchTicket(ctx, showingID, tx, ticketUrls); err != nil {
		rollback(ctx)
		return nil, err
	}

	// Download and assign tickets to each attendee
	if err := r.assignTickets(ctx, tx, showingID, ticketUrls); err != nil {
		rollback(ctx)
		return nil, err
	}

	if err := commit(ctx); err != nil {
		logger.Error(err, "failed to commit changes")
		return nil, fmt.Errorf("failed to commit changes")
	}
	return r.Query().Showing(ctx, &showingID, nil)
}

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
