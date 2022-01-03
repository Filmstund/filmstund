package mappers

import (
	"fmt"
	"strings"

	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/filmstund/filmstund/internal/graph/scalars"
	"github.com/filmstund/filmstund/internal/site"
)

func ToGraphUser(u dao.User, siteCfg site.Config) *model.User {
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
		GiftCertificates:       nil,
		CalendarFeedID:         fromUUID(u.CalendarFeedID),
		CalendarFeedURL:        toCalendarURL(u.CalendarFeedID, siteCfg),
		LastLoginTime:          u.LastLoginTime,
		SignupTime:             u.SignupTime,
		UpdateTime:             u.UpdateTime,
	}
}

func ToUpdateUserParams(newInfo model.UserDetailsInput, subject principal.Subject) dao.UpdateUserParams {
	return dao.UpdateUserParams{
		FilmstadenMembershipID: newInfo.FilmstadenMembershipID.String(),
		PhoneNumber:            fromStringP(newInfo.Phone),
		FirstName:              fromStringP(newInfo.FirstName),
		LastName:               fromStringP(newInfo.LastName),
		Nick:                   fromStringP(newInfo.Nick),
		SubjectID:              subject.String(),
	}
}
