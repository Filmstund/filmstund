package graph

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/currency"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/google/uuid"
)

func validateTicketURL(ctx context.Context, givenURL string) bool {
	const pattern = `.+filmstaden\.se/bokning/mina-e-biljetter/Sys.+?/.+?/.+`
	matched, err := regexp.MatchString(pattern, givenURL)
	if err != nil {
		logging.FromContext(ctx).Error(err, "regex match failed")
		return false
	}
	return matched
}

func splitTicketIDs(ticketURL string) (sysID, showID, ticketID string) {
	startIndex := strings.Index(ticketURL, "mina-e-biljetter/")
	parts := strings.Split(ticketURL[startIndex:], "/")
	if len(parts) != 4 { // first part is the substr above
		return
	}

	return parts[1], parts[2], parts[3]
}

func stringToNullString(str string) sql.NullString {
	return sql.NullString{
		String: str,
		Valid:  true,
	}
}

func (r *mutationResolver) updateShowingToMatchTicket(
	ctx context.Context,
	showingID uuid.UUID,
	tx *dao.Queries,
	ticketUrls []string,
) error {
	logger := logging.FromContext(ctx)

	_, fsShowID, _ := splitTicketIDs(ticketUrls[0])
	fsShow, err := r.filmstaden.Show(ctx, fsShowID)
	if err != nil {
		logger.Error(err, "failed to fetch FS show", "fsShowID", fsShowID)
		return fmt.Errorf("failed to fetch Filmstaden show using ID=%s", fsShowID)
	}

	if err := tx.AddCinemaScreen(ctx, dao.AddCinemaScreenParams{
		ID: fsShow.Screen.NcgID,
		Name: sql.NullString{
			Valid:  true,
			String: fsShow.Screen.Title,
		},
	}); err != nil {
		logger.Error(err, "tx.AddCinemaScreen failed", "screenID", fsShowID)
		return fmt.Errorf("failed to insert cinema screen")
	}

	adminID := principal.FromContext(ctx).ID
	if err := tx.UpdateShowing(ctx, dao.UpdateShowingParams{
		Price:               int32(currency.SEK(fsShow.MovieVersionPrice) * currency.Kronor),
		PayToUser:           adminID,
		Location:            fsShow.Cinema.Title,
		FilmstadenShowingID: stringToNullString(fsShowID),
		CinemaScreenID:      stringToNullString(fsShow.Screen.NcgID),
		Date:                fsShow.Time,
		Time:                fsShow.Time,
		ShowingID:           showingID,
		AdminID:             adminID,
	}); err != nil {
		logger.Error(err, "tx.UpdateShowing failed")
		return fmt.Errorf("failed to update showing to match tickets bought")
	}
	return nil
}

func nextTicketless(as []dao.AttendeesIncludingTicketsRow) *dao.AttendeesIncludingTicketsRow {
	// TODO: consider fsMembershipID
	for _, attendee := range as {
		if !attendee.TicketID.Valid {
			return &attendee
		}
	}

	return nil
}

func (r *mutationResolver) assignTickets(
	ctx context.Context,
	tx *dao.Queries,
	showingID uuid.UUID,
	ticketUrls []string,
) error {
	logger := logging.FromContext(ctx)

	attendees, err := tx.AttendeesIncludingTickets(ctx, showingID)
	if err != nil {
		logger.Error(err, "tx.AttendeesIncludingTickets failed")
		return errInternalServerError
	}

	for _, url := range ticketUrls {
		sysID, showID, ticketID := splitTicketIDs(url)
		tickets, err := r.filmstaden.Tickets(ctx, sysID, showID, ticketID)
		if err != nil {
			logger.Error(err, "failed to fetch Filmstaden tickets",
				"sysID", sysID,
				"showID", showID,
				"ticketID", ticketID,
			)
			continue
		}
		for _, ticket := range tickets {
			ticketless := nextTicketless(attendees)
			if ticketless == nil {
				logger.Info("no more attendees found without an assigned ticket")
				break
			}

			barcode, err := r.filmstaden.Barcode(ctx, ticket.QrCode)
			if err != nil {
				logger.Error(err, "failed to fetch barcode - skipping barcode ticket")
			}

			ticketTime, err := time.Parse("15:04", ticket.Show.Time)
			if err != nil {
				logger.Error(err, "failed to parse time", "time", ticket.Show.Time)
				return errInternalServerError
			}

			ticketDate, err := time.Parse("2006-01-02", ticket.Show.Date)
			if err != nil {
				logger.Error(err, "failed to parse date", "date", ticket.Show.Date)
				return errInternalServerError
			}

			if err := tx.AddTicket(ctx, dao.AddTicketParams{
				ID:                     ticket.ID,
				ShowingID:              showingID,
				AssignedToUser:         ticketless.UserID,
				ProfileID:              stringToNullString(ticket.ProfileID),
				Barcode:                *barcode,
				CustomerType:           ticket.CustomerType,
				CustomerTypeDefinition: ticket.CustomerTypeDefinition,
				Cinema:                 ticket.Cinema.Title,
				CinemaCity:             stringToNullString(ticket.Cinema.City.Name),
				Screen:                 ticket.Screen.Title,
				Date:                   ticketDate,
				Time:                   ticketTime,
				MovieName:              ticket.Movie.Title,
				MovieRating:            ticket.Movie.Rating.DisplayName,
			}); err != nil {
				logger.Error(err, "failed to add ticket", "ticketID", ticket.ID)
			}
		}
	}
	return nil
}
