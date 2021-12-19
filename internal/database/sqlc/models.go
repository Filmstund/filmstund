// Code generated by sqlc. DO NOT EDIT.

package sqlc

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Attendee struct {
	UserID              uuid.UUID      `json:"userID"`
	ShowingID           uuid.UUID      `json:"showingID"`
	AttendeeType        string         `json:"attendeeType"`
	HasPaid             bool           `json:"hasPaid"`
	AmountOwed          int32          `json:"amountOwed"`
	GiftCertificateUsed sql.NullString `json:"giftCertificateUsed"`
	LastModifiedDate    time.Time      `json:"lastModifiedDate"`
	CreatedDate         time.Time      `json:"createdDate"`
}

type CinemaScreen struct {
	ID          string         `json:"id"`
	Name        sql.NullString `json:"name"`
	CreatedDate time.Time      `json:"createdDate"`
}

type Commandment struct {
	Number      int32     `json:"number"`
	Phrase      string    `json:"phrase"`
	CreatedDate time.Time `json:"createdDate"`
}

type GiftCertificate struct {
	UserID      uuid.UUID `json:"userID"`
	Number      string    `json:"number"`
	ExpiresAt   time.Time `json:"expiresAt"`
	CreatedDate time.Time `json:"createdDate"`
}

type Location struct {
	Name             string          `json:"name"`
	CityAlias        sql.NullString  `json:"cityAlias"`
	City             sql.NullString  `json:"city"`
	StreetAddress    sql.NullString  `json:"streetAddress"`
	PostalCode       sql.NullString  `json:"postalCode"`
	PostalAddress    sql.NullString  `json:"postalAddress"`
	Latitude         sql.NullFloat64 `json:"latitude"`
	Longitude        sql.NullFloat64 `json:"longitude"`
	FilmstadenID     sql.NullString  `json:"filmstadenID"`
	LastModifiedDate time.Time       `json:"lastModifiedDate"`
	CreatedDate      time.Time       `json:"createdDate"`
}

type LocationAlias struct {
	Location         sql.NullString `json:"location"`
	Alias            string         `json:"alias"`
	LastModifiedDate time.Time      `json:"lastModifiedDate"`
	CreatedDate      time.Time      `json:"createdDate"`
}

type Movie struct {
	ID                    uuid.UUID      `json:"id"`
	FilmstadenID          sql.NullString `json:"filmstadenID"`
	ImdbID                sql.NullString `json:"imdbID"`
	TmdbID                sql.NullInt64  `json:"tmdbID"`
	Slug                  sql.NullString `json:"slug"`
	Title                 string         `json:"title"`
	Synopsis              sql.NullString `json:"synopsis"`
	OriginalTitle         sql.NullString `json:"originalTitle"`
	ReleaseDate           sql.NullTime   `json:"releaseDate"`
	ProductionYear        sql.NullInt32  `json:"productionYear"`
	Runtime               sql.NullInt64  `json:"runtime"`
	Poster                sql.NullString `json:"poster"`
	Genres                []string       `json:"genres"`
	Popularity            float64        `json:"popularity"`
	PopularityLastUpdated sql.NullTime   `json:"popularityLastUpdated"`
	Archived              bool           `json:"archived"`
	LastModifiedDate      time.Time      `json:"lastModifiedDate"`
	CreatedDate           time.Time      `json:"createdDate"`
}

type Session struct {
	ID               uuid.UUID `json:"id"`
	UserID           uuid.UUID `json:"userID"`
	RefreshToken     string    `json:"refreshToken"`
	Principal        []byte    `json:"principal"`
	ExpirationDate   time.Time `json:"expirationDate"`
	CreatedDate      time.Time `json:"createdDate"`
	LastModifiedDate time.Time `json:"lastModifiedDate"`
}

type Showing struct {
	ID                  uuid.UUID      `json:"id"`
	WebID               string         `json:"webID"`
	Slug                string         `json:"slug"`
	Date                time.Time      `json:"date"`
	Time                time.Time      `json:"time"`
	MovieID             uuid.UUID      `json:"movieID"`
	LocationID          string         `json:"locationID"`
	CinemaScreenID      sql.NullString `json:"cinemaScreenID"`
	FilmstadenShowingID sql.NullString `json:"filmstadenShowingID"`
	Price               int32          `json:"price"`
	TicketsBought       bool           `json:"ticketsBought"`
	Admin               uuid.UUID      `json:"admin"`
	PayToUser           uuid.UUID      `json:"payToUser"`
	LastModifiedDate    time.Time      `json:"lastModifiedDate"`
	CreatedDate         time.Time      `json:"createdDate"`
}

type Ticket struct {
	ID                     string         `json:"id"`
	ShowingID              uuid.NullUUID  `json:"showingID"`
	AssignedToUser         uuid.NullUUID  `json:"assignedToUser"`
	ProfileID              sql.NullString `json:"profileID"`
	Barcode                string         `json:"barcode"`
	CustomerType           string         `json:"customerType"`
	CustomerTypeDefinition string         `json:"customerTypeDefinition"`
	Cinema                 string         `json:"cinema"`
	CinemaCity             sql.NullString `json:"cinemaCity"`
	Screen                 string         `json:"screen"`
	SeatRow                int32          `json:"seatRow"`
	SeatNumber             int32          `json:"seatNumber"`
	Date                   time.Time      `json:"date"`
	Time                   time.Time      `json:"time"`
	MovieName              string         `json:"movieName"`
	MovieRating            string         `json:"movieRating"`
	Attributes             []string       `json:"attributes"`
	LastModifiedDate       time.Time      `json:"lastModifiedDate"`
	CreatedDate            time.Time      `json:"createdDate"`
}

type User struct {
	ID                     uuid.UUID      `json:"id"`
	SubjectID              string         `json:"subjectID"`
	FilmstadenMembershipID sql.NullString `json:"filmstadenMembershipID"`
	FirstName              string         `json:"firstName"`
	LastName               string         `json:"lastName"`
	Nick                   sql.NullString `json:"nick"`
	Email                  string         `json:"email"`
	Phone                  sql.NullString `json:"phone"`
	Avatar                 sql.NullString `json:"avatar"`
	CalendarFeedID         uuid.NullUUID  `json:"calendarFeedID"`
	LastLogin              time.Time      `json:"lastLogin"`
	SignupDate             time.Time      `json:"signupDate"`
	LastModifiedDate       time.Time      `json:"lastModifiedDate"`
}
