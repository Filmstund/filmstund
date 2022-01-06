// Code generated by sqlc. DO NOT EDIT.
// source: tickets.sql

package dao

import (
	"context"

	"github.com/google/uuid"
)

const myTickets = `-- name: MyTickets :many
SELECT id, showing_id, assigned_to_user, profile_id, barcode, customer_type, customer_type_definition, cinema, cinema_city, screen, seat_row, seat_number, date, time, movie_name, movie_rating, attributes, update_time, create_time
FROM tickets t
WHERE t.showing_id = $1
  AND t.assigned_to_user = $2
`

type MyTicketsParams struct {
	ShowingID uuid.UUID `json:"showingID"`
	UserID    uuid.UUID `json:"userID"`
}

func (q *Queries) MyTickets(ctx context.Context, arg MyTicketsParams) ([]Ticket, error) {
	rows, err := q.db.Query(ctx, myTickets, arg.ShowingID, arg.UserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Ticket
	for rows.Next() {
		var i Ticket
		if err := rows.Scan(
			&i.ID,
			&i.ShowingID,
			&i.AssignedToUser,
			&i.ProfileID,
			&i.Barcode,
			&i.CustomerType,
			&i.CustomerTypeDefinition,
			&i.Cinema,
			&i.CinemaCity,
			&i.Screen,
			&i.SeatRow,
			&i.SeatNumber,
			&i.Date,
			&i.Time,
			&i.MovieName,
			&i.MovieRating,
			&i.Attributes,
			&i.UpdateTime,
			&i.CreateTime,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}