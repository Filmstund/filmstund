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
	"github.com/filmstund/filmstund/internal/graph/dataloader"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/swish"
)

func (r *attendeeResolver) User(ctx context.Context, obj *model.Attendee) (*model.PublicUser, error) {
	pu, err := dataloader.FromContext(ctx).Load(obj.UserID)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to dataload attendee user", "userID", obj.UserID.ID)
		return nil, fmt.Errorf("failed to load attendee user")
	}
	return pu, nil
}

func (r *attendeePaymentDetailsResolver) PayTo(ctx context.Context, obj *model.AttendeePaymentDetails) (*model.PublicUser, error) {
	pu, err := dataloader.FromContext(ctx).Load(obj.PayTo.ID)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to dataload pay to user", "userID", obj.PayTo.ID)
		return nil, fmt.Errorf("failed to load pay to user")
	}
	return pu, nil
}

func (r *attendeePaymentDetailsResolver) Payer(ctx context.Context, obj *model.AttendeePaymentDetails) (*model.PublicUser, error) {
	pu, err := dataloader.FromContext(ctx).Load(obj.Payer.ID)
	if err != nil {
		logging.FromContext(ctx).Error(err, "failed to dataload payer", "userID", obj.Payer.ID)
		return nil, fmt.Errorf("failed to load payer")
	}
	return pu, nil
}

func (r *mutationResolver) UpdateAttendeePaymentInfo(ctx context.Context, paymentInfo model.AttendeePaymentInfoInput) (*model.Attendee, error) {
	logger := logging.FromContext(ctx).
		WithValues("userID", paymentInfo.UserID, "showingID", paymentInfo.ShowingID)
	query := database.FromContext(ctx)
	if err := query.UpdateAttendeePayment(ctx, dao.UpdateAttendeePaymentParams{
		HasPaid:    paymentInfo.HasPaid,
		AmountOwed: int32(paymentInfo.AmountOwed),
		UserID:     paymentInfo.UserID,
		ShowingID:  paymentInfo.ShowingID,
	}); err != nil {
		logger.Error(err, "query.UpdateAttendeePayment failed")
		return nil, fmt.Errorf("failed to update attendee payment info")
	}

	attendee, err := query.Attendee(ctx, dao.AttendeeParams{
		ShowingID: paymentInfo.ShowingID,
		UserID:    paymentInfo.UserID,
	})
	if err != nil {
		logger.Error(err, "query.Attendee failed")
		return nil, fmt.Errorf("failed to fetch attendee")
	}

	var gcUsed *model.GiftCertificate
	if attendee.GiftCertificateNumber.Valid {
		gcUsed = &model.GiftCertificate{
			Number:     attendee.GiftCertificateNumber.String,
			ExpireTime: attendee.GiftCertificateExpireTime.Time,
			Status:     model.GiftCertificateStatusUnknown, // TODO: calculate
		}
	}
	return &model.Attendee{
		UserID:                 attendee.UserID,
		User:                   nil, // separate resolver
		ShowingID:              attendee.ShowingID,
		HasPaid:                attendee.HasPaid,
		AmountOwed:             currency.SEK(attendee.AmountOwed),
		Type:                   model.PaymentType(attendee.AttendeeType),
		GiftCertificateUsed:    gcUsed,
		FilmstadenMembershipID: dao.NullString(attendee.FilmstadenMembershipID),
	}, nil
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
	if t := model.PaymentType(attendee.AttendeeType); attendee.AmountOwed > 0 &&
		!attendee.HasPaid &&
		t.IsValid() &&
		t == model.PaymentTypeSwish &&
		attendee.PayToPhone.Valid {
		amount := currency.SEK(attendee.AmountOwed).Kronor()
		uri, err := swish.FormatURI(attendee.PayToPhone.String, amount, attendee.MovieTitle)
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
