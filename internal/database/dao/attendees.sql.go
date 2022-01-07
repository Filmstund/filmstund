// Code generated by sqlc. DO NOT EDIT.
// source: attendees.sql

package dao

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

const addAttendee = `-- name: AddAttendee :exec
insert into attendees (user_id, showing_id, attendee_type, has_paid, amount_owed, gift_certificate_used)
values ($1, $2, $3, $4, $5, $6)
`

type AddAttendeeParams struct {
	UserID              uuid.UUID      `json:"userID"`
	ShowingID           uuid.UUID      `json:"showingID"`
	AttendeeType        string         `json:"attendeeType"`
	HasPaid             bool           `json:"hasPaid"`
	AmountOwed          int32          `json:"amountOwed"`
	GiftCertificateUsed sql.NullString `json:"giftCertificateUsed"`
}

func (q *Queries) AddAttendee(ctx context.Context, arg AddAttendeeParams) error {
	_, err := q.db.Exec(ctx, addAttendee,
		arg.UserID,
		arg.ShowingID,
		arg.AttendeeType,
		arg.HasPaid,
		arg.AmountOwed,
		arg.GiftCertificateUsed,
	)
	return err
}
