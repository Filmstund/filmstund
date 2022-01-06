package dao

import (
	"github.com/filmstund/filmstund/internal/graph/model"
)

type Attendees []PublicAttendeesRow

func (row PublicAttendeesRow) GraphModel() *model.PublicAttendee {
	return &model.PublicAttendee{
		UserID:    row.UserID,
		ShowingID: row.ShowingID,
		UserInfo: &model.PublicUser{
			ID:        row.UserID,
			Name:      row.Name,
			FirstName: row.FirstName,
			LastName:  row.LastName,
			Nick:      nullString(row.Nick),
			Phone:     nullString(row.Phone),
			AvatarURL: nullString(row.AvatarURL),
		},
	}
}

func (rows Attendees) GraphModels() []*model.PublicAttendee {
	attendees := make([]*model.PublicAttendee, len(rows))
	for i, row := range rows {
		attendees[i] = row.GraphModel()
	}
	return attendees
}
