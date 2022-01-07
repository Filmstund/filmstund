package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/currency"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/swish"
)

func (r *attendeeResolver) User(ctx context.Context, obj *model.Attendee) (*model.PublicUser, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *attendeePaymentDetailsResolver) PayTo(ctx context.Context, obj *model.AttendeePaymentDetails) (*model.PublicUser, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *attendeePaymentDetailsResolver) Payer(ctx context.Context, obj *model.AttendeePaymentDetails) (*model.PublicUser, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateAttendeePaymentInfo(ctx context.Context, paymentInfo model.AttendeePaymentInfoInput) (*model.Attendee, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) AdminPaymentDetails(ctx context.Context, obj *model.Showing) (*model.AdminPaymentDetails, error) {
	logger := logging.FromContext(ctx).
		WithValues("showingID", obj.ID)
	query := database.FromContext(ctx)
	adminID := principal.FromContext(ctx).ID

	dbAttendees, err := query.ListAttendees(ctx, dao.ListAttendeesParams{
		ShowingID: obj.ID,
		AdminID:   adminID,
	})
	if err != nil {
		logger.Error(err, "query.ListAttendees failed")
		return nil, fmt.Errorf("failed to list attendee payment details")
	}

	attendees := make([]*model.Attendee, len(dbAttendees))
	for i, a := range dbAttendees {
		var gcUsed *model.GiftCertificate
		if a.GiftCertificateNumber.Valid {
			gcUsed = &model.GiftCertificate{
				Number:     a.GiftCertificateNumber.String,
				ExpireTime: a.GiftCertificateExpireTime.Time,
				Status:     model.GiftCertificateStatusUnknown, // TODO: calculate
			}
		}

		attendees[i] = &model.Attendee{
			UserID:                 a.UserID,
			User:                   &model.PublicUser{ID: a.UserID}, // different resolver
			ShowingID:              obj.ID,
			HasPaid:                a.HasPaid,
			AmountOwed:             currency.SEK(a.AmountOwed),
			Type:                   model.PaymentType(a.AttendeeType),
			GiftCertificateUsed:    gcUsed,
			FilmstadenMembershipID: dao.NullString(a.FilmstadenMembershipID),
		}
	}

	fsBuyLink := new(string)
	slugAndFSID, err := query.LookupSlugAndFSID(ctx, obj.MovieID)
	if err != nil {
		logger.Error(err, "failed to lookup movie slug and FS ID")
	} else {
		*fsBuyLink = fmt.Sprintf("https://www.filmstaden.se/film/%s/%s", slugAndFSID.FilmstadenID, slugAndFSID.Slug)
	}

	return &model.AdminPaymentDetails{
		FilmstadenBuyLink: fsBuyLink,
		ShowingID:         obj.ID,
		Attendees:         attendees,
	}, nil
}

func (r *showingResolver) AttendeePaymentDetails(ctx context.Context, obj *model.Showing) (*model.AttendeePaymentDetails, error) {
	var (
		logger        = logging.FromContext(ctx).WithValues("showingID", obj.ID)
		query         = database.FromContext(ctx)
		currentUserID = principal.FromContext(ctx).ID
	)

	attendee, err := query.AttendeePaymentDetails(ctx, dao.AttendeePaymentDetailsParams{
		ShowingID: obj.ID,
		UserID:    currentUserID,
	})
	if err != nil {
		logger.Error(err, "query.AttendeePaymentDetails failed")
		return nil, fmt.Errorf("failed to lookup attendee payment details")
	}

	swishLink := new(string)
	if t := model.PaymentType(attendee.AttendeeType); !attendee.HasPaid && t.IsValid() && t == model.PaymentTypeSwish {
		amount := currency.SEK(attendee.AmountOwed).Kronor()
		uri, err := swish.FormatURI(attendee.PayToPhone, amount, attendee.MovieTitle)
		if err != nil {
			logger.Error(err, "failed to construct Swish URI")
		} else {
			*swishLink = uri
		}
	}

	details := &model.AttendeePaymentDetails{
		HasPaid:    attendee.HasPaid,
		AmountOwed: currency.SEK(attendee.AmountOwed),
		PayTo:      obj.PayToUser,
		Payer:      &model.PublicUser{ID: attendee.UserID},
		SwishLink:  swishLink,
	}
	return details, nil
}

// Attendee returns gql.AttendeeResolver implementation.
func (r *Resolver) Attendee() gql.AttendeeResolver { return &attendeeResolver{r} }

// AttendeePaymentDetails returns gql.AttendeePaymentDetailsResolver implementation.
func (r *Resolver) AttendeePaymentDetails() gql.AttendeePaymentDetailsResolver {
	return &attendeePaymentDetailsResolver{r}
}

type (
	attendeeResolver               struct{ *Resolver }
	attendeePaymentDetailsResolver struct{ *Resolver }
)
