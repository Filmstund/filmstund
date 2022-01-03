package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (r *mutationResolver) AttendShowing(ctx context.Context, showingID string, paymentOption model.PaymentOption) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UnattendShowing(ctx context.Context, showingID string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateShowing(ctx context.Context, showing model.CreateShowingInput) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) DeleteShowing(ctx context.Context, showingID string) ([]*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) MarkAsBought(ctx context.Context, showingID string, price string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) ProcessTicketUrls(ctx context.Context, showingID string, ticketUrls []string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateShowing(ctx context.Context, showingID string, newValues *model.UpdateShowingInput) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) PromoteToAdmin(ctx context.Context, showingID string, userToPromote string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Showing(ctx context.Context, id *string, webID *string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) PublicShowings(ctx context.Context, afterDate *string) ([]*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) ShowingForMovie(ctx context.Context, movieID *string) ([]*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) FilmstadenSeatMap(ctx context.Context, obj *model.Showing) ([]*model.FilmstadenSeatMap, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) Attendees(ctx context.Context, obj *model.Showing) ([]*model.PublicAttendee, error) {
	panic(fmt.Errorf("not implemented"))
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

// Query returns gql.QueryResolver implementation.
func (r *Resolver) Query() gql.QueryResolver { return &queryResolver{r} }

// Showing returns gql.ShowingResolver implementation.
func (r *Resolver) Showing() gql.ShowingResolver { return &showingResolver{r} }

type (
	mutationResolver struct{ *Resolver }
	queryResolver    struct{ *Resolver }
	showingResolver  struct{ *Resolver }
)
