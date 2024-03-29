package graph

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/currency"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/go-logr/logr"
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

func nextTicketless(as map[uuid.UUID]bool) *uuid.UUID {
	for userID, hasTicket := range as {
		if !hasTicket {
			return &userID
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

	assignmentStatus, err := r.fetchTicketAssignments(ctx, tx, showingID, logger)
	if err != nil {
		return err
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
			var assignToUser uuid.UUID
			ticketless := nextTicketless(assignmentStatus)
			if ticketless == nil {
				logger.Info("no more attendees found without an assigned ticket - assigning the admin",
					"ticketID", ticket.ID,
				)
				assignToUser = principal.FromContext(ctx).ID // current logged in user must be admin
			} else {
				assignToUser = *ticketless
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
				AssignedToUser:         assignToUser,
				ProfileID:              stringToNullString(ticket.ProfileID),
				Barcode:                *barcode,
				CustomerType:           ticket.CustomerType,
				CustomerTypeDefinition: ticket.CustomerTypeDefinition,
				Cinema:                 ticket.Cinema.Title,
				CinemaCity:             stringToNullString(ticket.Cinema.City.Name),
				Screen:                 ticket.Screen.Title,
				SeatRow:                int32(ticket.Seat.Row),
				SeatNumber:             int32(ticket.Seat.Number),
				Date:                   ticketDate,
				Time:                   ticketTime,
				MovieName:              ticket.Movie.Title,
				MovieRating:            ticket.Movie.Rating.DisplayName,
			}); err != nil {
				logger.Error(err, "failed to add ticket", "ticketID", ticket.ID)
			}

			// This just marks the user at not being ticketless anymore
			assignmentStatus[assignToUser] = true
		}
	}
	return nil
}

func (r *mutationResolver) fetchTicketAssignments(
	ctx context.Context,
	tx *dao.Queries,
	showingID uuid.UUID,
	logger logr.Logger,
) (map[uuid.UUID]bool, error) {
	attendees, err := tx.AttendeesIncludingTickets(ctx, showingID)
	if err != nil {
		logger.Error(err, "tx.AttendeesIncludingTickets failed")
		return nil, errInternalServerError
	}
	assignmentStatus := make(map[uuid.UUID]bool, len(attendees))
	for _, a := range attendees {
		assignmentStatus[a.UserID] = a.TicketID.Valid
	}
	return assignmentStatus, nil
}

// groupRows returns a map with the key being the row, and the value being all seats on that row.
func groupRows(tickets []dao.TicketSeatingsRow) map[int][]int {
	set := make(map[int][]int, len(tickets))
	for _, ticket := range tickets {
		row := int(ticket.SeatRow)
		set[row] = append(set[row], int(ticket.SeatNumber))
	}
	return set
}

func distinctRows(tickets map[int][]int) []int {
	rows := make([]int, 0, len(tickets))
	for row := range tickets {
		rows = append(rows, row)
	}
	sort.Ints(rows)
	return rows
}

func mapToSeatRange(tickets map[int][]int) []*model.SeatRange {
	seatRange := make([]*model.SeatRange, 0, len(tickets))
	for row, seats := range tickets {
		seatRange = append(seatRange, &model.SeatRange{
			Row:     row,
			Numbers: seats,
		})
	}
	return seatRange
}
