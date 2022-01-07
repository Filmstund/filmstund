package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/currency"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/gql"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
	"github.com/gosimple/slug"
)

func (r *mutationResolver) AttendShowing(ctx context.Context, showingID uuid.UUID, paymentOption model.PaymentOption) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UnattendShowing(ctx context.Context, showingID uuid.UUID) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateShowing(ctx context.Context, showing model.CreateShowingInput) (*model.Showing, error) {
	logger := logging.FromContext(ctx).
		WithValues(
			"action", "createShowing",
			"movieID", showing.MovieID,
			"date", showing.Date,
			"time", showing.Time,
		)
	ctx = logging.WithLogger(ctx, logger)

	adminID := principal.FromContext(ctx).ID
	query, commit, rollback, err := r.db.TX(ctx)
	if err != nil {
		logger.Error(err, "failed to setup DB transaction")
		return nil, fmt.Errorf("internal server error")
	}

	movieTitle, err := query.LookupMovieTitle(ctx, showing.MovieID)
	if err != nil {
		rollback(ctx)
		logger.Error(err, "query.LookupMovieTitle failed")
		return nil, fmt.Errorf("failed to lookup movie")
	}

	var (
		showingID      = uuid.New()
		showSlug       = slug.Make(movieTitle)
		webID          = base64.RawURLEncoding.EncodeToString(showingID[:])[:10]
		cinemaScreenID sql.NullString
		fsShowingID    sql.NullString
	)

	/*
		// TODO: needs FK and insert in CinemaScreen table
		if scr := showing.FilmstadenScreen; scr != nil {
			cinemaScreenID = sql.NullString{
				String: scr.ID,
				Valid:  true,
			}
		}
	*/

	if id := showing.FilmstadenRemoteEntityID; id != nil {
		fsShowingID = sql.NullString{
			String: *id,
			Valid:  true,
		}
	}

	insertedShowing, err := query.AddShowing(ctx, dao.AddShowingParams{
		ID:                  showingID,
		WebID:               webID,
		Slug:                showSlug,
		Date:                showing.Date,
		Time:                showing.Time,
		MovieID:             showing.MovieID,
		Location:            showing.Location,
		CinemaScreenID:      cinemaScreenID,
		FilmstadenShowingID: fsShowingID,
		Admin:               adminID,
		PayToUser:           adminID,
	})
	if err != nil {
		rollback(ctx)
		logger.Error(err, "query.AddShowing failed")
		return nil, fmt.Errorf("failed to add your showing")
	}

	if err := query.AddAttendee(ctx, dao.AddAttendeeParams{
		UserID:              adminID,
		ShowingID:           showingID,
		AttendeeType:        string(model.PaymentTypeSwish),
		HasPaid:             true,
		AmountOwed:          0,
		GiftCertificateUsed: sql.NullString{}, // nil
	}); err != nil {
		rollback(ctx)
		logger.Error(err, "query.AddAttendee failed")
		return nil, fmt.Errorf("failed to add you as an attendee")
	}

	if err := commit(ctx); err != nil {
		// TODO: do you need to rollback? 🤔
		logger.Error(err, "failed to commit new showing")
		return nil, fmt.Errorf("failed to insert new showing")
	}
	return insertedShowing.GraphModel(), nil
}

func (r *mutationResolver) DeleteShowing(ctx context.Context, showingID uuid.UUID) ([]*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) MarkAsBought(ctx context.Context, showingID uuid.UUID, price currency.SEK) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) ProcessTicketUrls(ctx context.Context, showingID uuid.UUID, ticketUrls []string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) UpdateShowing(ctx context.Context, showingID uuid.UUID, newValues *model.UpdateShowingInput) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) PromoteToAdmin(ctx context.Context, showingID uuid.UUID, userToPromote uuid.UUID) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Showing(ctx context.Context, id *uuid.UUID, webID *string) (*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) PublicShowings(ctx context.Context, afterDate *time.Time) ([]*model.Showing, error) {
	logger := logging.FromContext(ctx).
		WithValues("afterDate", afterDate)
	query := database.FromContext(ctx)

	var after time.Time
	if afterDate == nil {
		after = time.Unix(0, 0)
	} else {
		after = *afterDate
	}

	showings, err := query.PublicShowings(ctx, after)
	if err != nil {
		logger.Error(err, "PublicShowings query failed")
		return nil, fmt.Errorf("failed to fetch public showings")
	}
	return dao.Showings(showings).GraphModel(), nil
}

func (r *queryResolver) ShowingForMovie(ctx context.Context, movieID *uuid.UUID) ([]*model.Showing, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) Movie(ctx context.Context, obj *model.Showing) (*model.Movie, error) {
	query := database.FromContext(ctx)
	movie, err := query.Movie(ctx, obj.Movie.ID)
	if err != nil {
		logging.FromContext(ctx).Error(err, "query.Movie failed", "movieID", obj.Movie.ID)
		return nil, fmt.Errorf("failed to fetch movie")
	}
	return movie.GraphModel(), nil
}

func (r *showingResolver) CinemaScreen(ctx context.Context, obj *model.Showing) (*model.CinemaScreen, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) Admin(ctx context.Context, obj *model.Showing) (*model.PublicUser, error) {
	logger := logging.FromContext(ctx).
		WithValues("showingID", obj.ID,
			"adminID", obj.Admin.ID,
		)
	query := database.FromContext(ctx)
	user, err := query.PublicUser(ctx, obj.Admin.ID)
	if err != nil {
		logger.Error(err, "failed to fetch Admin on showing")
		return nil, fmt.Errorf("failed to fetch (admin) user")
	}

	return user.GraphModel(), nil
}

func (r *showingResolver) PayToUser(ctx context.Context, obj *model.Showing) (*model.PublicUser, error) {
	logger := logging.FromContext(ctx).
		WithValues("showingID", obj.ID,
			"payToUserID", obj.PayToUser.ID,
		)
	query := database.FromContext(ctx)
	user, err := query.PublicUser(ctx, obj.PayToUser.ID)
	if err != nil {
		logger.Error(err, "failed to fetch PayToUser on showing")
		return nil, fmt.Errorf("failed to fetch (pay to) user")
	}

	return user.GraphModel(), nil
}

func (r *showingResolver) FilmstadenSeatMap(ctx context.Context, obj *model.Showing) ([]*model.FilmstadenSeatMap, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *showingResolver) Attendees(ctx context.Context, obj *model.Showing) ([]*model.PublicAttendee, error) {
	query := database.FromContext(ctx)
	attendees, err := query.PublicAttendees(ctx, obj.ID)
	if err != nil {
		logging.FromContext(ctx).Error(err, "query.PublicAttendees failed", "showingID", obj.ID)
		return nil, fmt.Errorf("failed to fetch attendees")
	}
	return dao.Attendees(attendees).GraphModels(), nil
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
