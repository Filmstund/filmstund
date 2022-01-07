package dao

import (
	"github.com/filmstund/filmstund/internal/currency"
	"github.com/filmstund/filmstund/internal/graph/model"
)

type Showings []Showing

func (showing *Showing) GraphModel() *model.Showing {
	price := currency.SEK(showing.Price)

	var cinemaScreen *model.CinemaScreen
	if id := showing.CinemaScreenID; id.Valid {
		cinemaScreen = &model.CinemaScreen{ID: id.String}
	}

	return &model.Showing{
		ID:                  showing.ID,
		WebID:               showing.WebID,
		FilmstadenShowingID: NullString(showing.FilmstadenShowingID),
		Slug:                showing.Slug,
		Date:                showing.Date,
		Time:                showing.Time,
		MovieID:             showing.MovieID,
		Movie: &model.Movie{
			ID: showing.MovieID,
		}, // separate resolver
		Location:               showing.Location,
		CinemaScreen:           cinemaScreen, // separate resolver
		Price:                  &price,
		TicketsBought:          showing.TicketsBought,
		Admin:                  &model.PublicUser{ID: showing.Admin}, // separate resolver
		Private:                showing.Private,
		PayToUser:              &model.PublicUser{ID: showing.PayToUser}, // separate resolver
		UpdateTime:             showing.UpdateTime,
		CreateTime:             showing.CreateTime,
		FilmstadenSeatMap:      nil, // separate resolver
		Attendees:              nil, // separate resolver
		AdminPaymentDetails:    nil, // separate resolver
		AttendeePaymentDetails: nil, // separate resolver
		MyTickets:              nil, // separate resolver
		TicketRange:            nil, // separate resolver
	}
}

func (showings Showings) GraphModel() []*model.Showing {
	graphShowings := make([]*model.Showing, len(showings))
	for i, s := range showings {
		graphShowings[i] = s.GraphModel()
	}
	return graphShowings
}
