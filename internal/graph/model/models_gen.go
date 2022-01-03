// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/filmstund/filmstund/internal/graph/scalars"
	"github.com/google/uuid"
)

type AdminPaymentDetails struct {
	FilmstadenBuyLink *string     `json:"filmstadenBuyLink"`
	ShowingID         *string     `json:"showingID"`
	Attendees         []*Attendee `json:"attendees"`
}

type Attendee struct {
	UserID                 string           `json:"userID"`
	User                   *PublicUser      `json:"user"`
	ShowingID              string           `json:"showingID"`
	HasPaid                bool             `json:"hasPaid"`
	AmountOwed             string           `json:"amountOwed"`
	Type                   PaymentType      `json:"type"`
	GiftCertificateUsed    *GiftCertificate `json:"giftCertificateUsed"`
	FilmstadenMembershipID *string          `json:"filmstadenMembershipID"`
}

type AttendeePaymentDetails struct {
	HasPaid    bool        `json:"hasPaid"`
	AmountOwed string      `json:"amountOwed"`
	PayTo      *PublicUser `json:"payTo"`
	Payer      *PublicUser `json:"payer"`
	SwishLink  *string     `json:"swishLink"`
}

type AttendeePaymentInfoInput struct {
	UserID     string  `json:"userID"`
	ShowingID  *string `json:"showingID"`
	HasPaid    bool    `json:"hasPaid"`
	AmountOwed string  `json:"amountOwed"`
}

type CinemaScreen struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CinemaScreenInput struct {
	ID   string  `json:"id"`
	Name *string `json:"name"`
}

type Commandments struct {
	Number int    `json:"number"`
	Phrase string `json:"phrase"`
}

type CreateShowingInput struct {
	Date                     string             `json:"date"`
	Time                     string             `json:"time"`
	MovieID                  string             `json:"movieID"`
	Location                 string             `json:"location"`
	FilmstadenScreen         *CinemaScreenInput `json:"filmstadenScreen"`
	FilmstadenRemoteEntityID *string            `json:"filmstadenRemoteEntityID"`
}

type FilmstadenLiteScreen struct {
	FilmstadenID string `json:"filmstadenID"`
	Name         string `json:"name"`
}

type FilmstadenSeatCoordinates struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type FilmstadenSeatDimensions struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type FilmstadenSeatMap struct {
	Row         int                        `json:"row"`
	Number      int                        `json:"number"`
	SeatType    string                     `json:"seatType"`
	Coordinates *FilmstadenSeatCoordinates `json:"coordinates"`
	Dimensions  *FilmstadenSeatDimensions  `json:"dimensions"`
}

type FilmstadenShowing struct {
	CinemaName               string                `json:"cinemaName"`
	Screen                   *FilmstadenLiteScreen `json:"screen"`
	SeatCount                int                   `json:"seatCount"`
	TimeUtc                  string                `json:"timeUtc"`
	Tags                     []string              `json:"tags"`
	FilmstadenRemoteEntityID string                `json:"filmstadenRemoteEntityID"`
}

type GiftCertificate struct {
	Number     string                `json:"number"`
	ExpireTime time.Time             `json:"expireTime"`
	Status     GiftCertificateStatus `json:"status"`
}

type GiftCertificateInput struct {
	Number     string     `json:"number"`
	ExpireTime *time.Time `json:"expireTime"`
}

type Movie struct {
	ID                 string               `json:"id"`
	FilmstadenID       string               `json:"filmstadenID"`
	ImdbID             *string              `json:"imdbID"`
	TmdbID             *string              `json:"tmdbID"`
	Slug               string               `json:"slug"`
	Title              string               `json:"title"`
	ReleaseDate        string               `json:"releaseDate"`
	ProductionYear     int                  `json:"productionYear"`
	Runtime            string               `json:"runtime"`
	Poster             *string              `json:"poster"`
	Genres             []string             `json:"genres"`
	Archived           bool                 `json:"archived"`
	UpdateTime         string               `json:"updateTime"`
	CreateTime         string               `json:"createTime"`
	FilmstadenShowings []*FilmstadenShowing `json:"filmstadenShowings"`
}

type PaymentOption struct {
	Type         PaymentType `json:"type"`
	TicketNumber *string     `json:"ticketNumber"`
}

type PublicAttendee struct {
	UserID    string      `json:"userID"`
	ShowingID string      `json:"showingID"`
	UserInfo  *PublicUser `json:"userInfo"`
}

type PublicUser struct {
	ID        string  `json:"id"`
	Name      *string `json:"name"`
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	Nick      *string `json:"nick"`
	Phone     *string `json:"phone"`
	Avatar    *string `json:"avatar"`
}

type Seat struct {
	Row    int `json:"row"`
	Number int `json:"number"`
}

type SeatRange struct {
	Row     int   `json:"row"`
	Numbers []int `json:"numbers"`
}

type Showing struct {
	ID                     string                  `json:"id"`
	WebID                  string                  `json:"webID"`
	FilmstadenShowingID    *string                 `json:"filmstadenShowingID"`
	Slug                   string                  `json:"slug"`
	Date                   string                  `json:"date"`
	Time                   string                  `json:"time"`
	MovieID                string                  `json:"movieID"`
	MovieTitle             string                  `json:"movieTitle"`
	Movie                  *Movie                  `json:"movie"`
	Location               string                  `json:"location"`
	CinemaScreen           *CinemaScreen           `json:"cinemaScreen"`
	Price                  *string                 `json:"price"`
	TicketsBought          bool                    `json:"ticketsBought"`
	Admin                  *PublicUser             `json:"admin"`
	PayToUser              *PublicUser             `json:"payToUser"`
	LastModifiedDate       string                  `json:"lastModifiedDate"`
	CreatedDate            string                  `json:"createdDate"`
	FilmstadenSeatMap      []*FilmstadenSeatMap    `json:"filmstadenSeatMap"`
	Attendees              []*PublicAttendee       `json:"attendees"`
	AdminPaymentDetails    *AdminPaymentDetails    `json:"adminPaymentDetails"`
	AttendeePaymentDetails *AttendeePaymentDetails `json:"attendeePaymentDetails"`
	MyTickets              []*Ticket               `json:"myTickets"`
	TicketRange            *TicketRange            `json:"ticketRange"`
}

type Ticket struct {
	ID                     string   `json:"id"`
	ShowingID              string   `json:"showingID"`
	AssignedToUser         string   `json:"assignedToUser"`
	ProfileID              *string  `json:"profileID"`
	Barcode                string   `json:"barcode"`
	CustomerType           string   `json:"customerType"`
	CustomerTypeDefinition string   `json:"customerTypeDefinition"`
	Cinema                 string   `json:"cinema"`
	CinemaCity             *string  `json:"cinemaCity"`
	Screen                 string   `json:"screen"`
	Seat                   *Seat    `json:"seat"`
	Date                   string   `json:"date"`
	Time                   string   `json:"time"`
	MovieName              string   `json:"movieName"`
	MovieRating            string   `json:"movieRating"`
	Attributes             []string `json:"attributes"`
}

type TicketRange struct {
	Rows       []int        `json:"rows"`
	Seatings   []*SeatRange `json:"seatings"`
	TotalCount int          `json:"totalCount"`
}

type UpdateShowingInput struct {
	Price                    string  `json:"price"`
	PayToUser                string  `json:"payToUser"`
	Location                 string  `json:"location"`
	FilmstadenRemoteEntityID *string `json:"filmstadenRemoteEntityID"`
	Time                     string  `json:"time"`
	Date                     string  `json:"date"`
}

type User struct {
	ID                     uuid.UUID                       `json:"id"`
	FilmstadenMembershipID *scalars.FilmstadenMembershipID `json:"filmstadenMembershipID"`
	Name                   string                          `json:"name"`
	FirstName              string                          `json:"firstName"`
	LastName               string                          `json:"lastName"`
	Nick                   *string                         `json:"nick"`
	Email                  string                          `json:"email"`
	Phone                  *string                         `json:"phone"`
	AvatarURL              *string                         `json:"avatarURL"`
	GiftCertificates       []*GiftCertificate              `json:"giftCertificates"`
	CalendarFeedID         *string                         `json:"calendarFeedID"`
	CalendarFeedURL        *string                         `json:"calendarFeedUrl"`
	LastLoginTime          time.Time                       `json:"lastLoginTime"`
	SignupTime             time.Time                       `json:"signupTime"`
	UpdateTime             time.Time                       `json:"updateTime"`
}

type UserDetailsInput struct {
	FirstName              *string                         `json:"firstName"`
	LastName               *string                         `json:"lastName"`
	Nick                   *string                         `json:"nick"`
	FilmstadenMembershipID *scalars.FilmstadenMembershipID `json:"filmstadenMembershipID"`
	Phone                  *string                         `json:"phone"`
}

type GiftCertificateStatus string

const (
	GiftCertificateStatusAvailable GiftCertificateStatus = "AVAILABLE"
	GiftCertificateStatusPending   GiftCertificateStatus = "PENDING"
	GiftCertificateStatusUsed      GiftCertificateStatus = "USED"
	GiftCertificateStatusExpired   GiftCertificateStatus = "EXPIRED"
	GiftCertificateStatusUnknown   GiftCertificateStatus = "UNKNOWN"
)

var AllGiftCertificateStatus = []GiftCertificateStatus{
	GiftCertificateStatusAvailable,
	GiftCertificateStatusPending,
	GiftCertificateStatusUsed,
	GiftCertificateStatusExpired,
	GiftCertificateStatusUnknown,
}

func (e GiftCertificateStatus) IsValid() bool {
	switch e {
	case GiftCertificateStatusAvailable, GiftCertificateStatusPending, GiftCertificateStatusUsed, GiftCertificateStatusExpired, GiftCertificateStatusUnknown:
		return true
	}
	return false
}

func (e GiftCertificateStatus) String() string {
	return string(e)
}

func (e *GiftCertificateStatus) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GiftCertificateStatus(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GiftCertificate_Status", str)
	}
	return nil
}

func (e GiftCertificateStatus) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type PaymentType string

const (
	PaymentTypeSwish           PaymentType = "SWISH"
	PaymentTypeGiftCertificate PaymentType = "GIFT_CERTIFICATE"
)

var AllPaymentType = []PaymentType{
	PaymentTypeSwish,
	PaymentTypeGiftCertificate,
}

func (e PaymentType) IsValid() bool {
	switch e {
	case PaymentTypeSwish, PaymentTypeGiftCertificate:
		return true
	}
	return false
}

func (e PaymentType) String() string {
	return string(e)
}

func (e *PaymentType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = PaymentType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid PaymentType", str)
	}
	return nil
}

func (e PaymentType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
