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
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/swish"
)

func (r *mutationResolver) UpdateAttendeePaymentInfo(ctx context.Context, paymentInfo model.AttendeePaymentInfoInput) (*model.Attendee, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) AdminPaymentDetails(ctx context.Context, obj *model.Showing) (*model.AdminPaymentDetails, error) {
	panic(fmt.Errorf("not implemented"))
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
