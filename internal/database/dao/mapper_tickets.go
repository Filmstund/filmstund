package dao

import (
	"github.com/filmstund/filmstund/internal/graph/model"
)

type Tickets []Ticket

func (row Ticket) GraphModel() *model.Ticket {
	return &model.Ticket{
		ID:                     row.ID,
		ShowingID:              row.ShowingID,
		AssignedToUser:         row.AssignedToUser,
		ProfileID:              nullString(row.ProfileID),
		Barcode:                row.Barcode,
		CustomerType:           row.CustomerType,
		CustomerTypeDefinition: row.CustomerTypeDefinition,
		Cinema:                 row.Cinema,
		CinemaCity:             nullString(row.CinemaCity),
		Screen:                 row.Screen,
		Seat: &model.Seat{
			Row:    int(row.SeatRow),
			Number: int(row.SeatNumber),
		},
		Date:        row.Date,
		Time:        row.Time.Format("15:04"),
		MovieName:   row.MovieName,
		MovieRating: row.MovieRating,
		Attributes:  row.Attributes,
	}
}

func (rows Tickets) GraphModel() []*model.Ticket {
	tickets := make([]*model.Ticket, len(rows))
	for i, row := range rows {
		tickets[i] = row.GraphModel()
	}
	return tickets
}
