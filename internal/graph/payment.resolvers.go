package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) UpdateAttendeePaymentInfo(ctx context.Context, paymentInfo model.AttendeePaymentInfoInput) (*model.Attendee, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) AdminPaymentDetails(ctx context.Context, obj *model.Showing) (*model.AdminPaymentDetails, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) AttendeePaymentDetails(ctx context.Context, obj *model.Showing) (*model.AttendeePaymentDetails, error) {
	panic(fmt.Errorf("not implemented"))
}
