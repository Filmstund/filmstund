package mappers

import (
	"fmt"
	"strings"

	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/graph/scalars"
	"github.com/filmstund/filmstund/internal/security/principal"
)

func ToGraphUser(u sqlc.User) *model.User {
	return &model.User{
		ID:                     u.ID,
		FilmstadenMembershipID: scalars.NewFilmstadenMembershipID(u.FilmstadenMembershipID),
		Name:                   strings.TrimSpace(fmt.Sprintf("%s %s", u.FirstName, u.LastName)),
		FirstName:              u.FirstName,
		LastName:               u.LastName,
		Nick:                   toString(u.Nick),
		Email:                  u.Email,
		Phone:                  toString(u.Phone),
		AvatarURL:              toString(u.Avatar),
		GiftCertificates:       nil, // TODO
		CalendarFeedID:         nil, // TODO
		CalendarFeedURL:        nil, // TODO
		LastLogin:              u.LastLogin,
		SignupDate:             u.SignupDate,
		LastModifiedDate:       u.LastModifiedDate,
	}
}

func ToUpdateUserParams(newInfo model.UserDetailsInput, subject principal.Subject) sqlc.UpdateUserParams {
	return sqlc.UpdateUserParams{
		FilmstadenMembershipID: newInfo.FilmstadenMembershipID.String(),
		PhoneNumber:            fromStringP(newInfo.Phone),
		FirstName:              fromStringP(newInfo.FirstName),
		LastName:               fromStringP(newInfo.LastName),
		Nick:                   fromStringP(newInfo.Nick),
		SubjectID:              subject.String(),
	}
}
