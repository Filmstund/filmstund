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

const attendee = `-- name: Attendee :one
SELECT a.user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       gift_certificate_used,
       u.filmstaden_membership_id,
       gc.number      as gift_certificate_number,
       gc.expire_time as gift_certificate_expire_time
FROM attendees a
         left join users u on u.id = a.user_id
         left outer join showings s on s.id = a.showing_id
         left outer join gift_certificate gc on gc.user_id = a.user_id and gc.number = a.gift_certificate_used
WHERE a.showing_id = $1
  AND a.user_id = $2
`

type AttendeeParams struct {
	ShowingID uuid.UUID `json:"showingID"`
	UserID    uuid.UUID `json:"userID"`
}

type AttendeeRow struct {
	UserID                    uuid.UUID      `json:"userID"`
	ShowingID                 uuid.UUID      `json:"showingID"`
	HasPaid                   bool           `json:"hasPaid"`
	AmountOwed                int32          `json:"amountOwed"`
	AttendeeType              string         `json:"attendeeType"`
	GiftCertificateUsed       sql.NullString `json:"giftCertificateUsed"`
	FilmstadenMembershipID    sql.NullString `json:"filmstadenMembershipID"`
	GiftCertificateNumber     sql.NullString `json:"giftCertificateNumber"`
	GiftCertificateExpireTime sql.NullTime   `json:"giftCertificateExpireTime"`
}

func (q *Queries) Attendee(ctx context.Context, arg AttendeeParams) (AttendeeRow, error) {
	row := q.db.QueryRow(ctx, attendee, arg.ShowingID, arg.UserID)
	var i AttendeeRow
	err := row.Scan(
		&i.UserID,
		&i.ShowingID,
		&i.HasPaid,
		&i.AmountOwed,
		&i.AttendeeType,
		&i.GiftCertificateUsed,
		&i.FilmstadenMembershipID,
		&i.GiftCertificateNumber,
		&i.GiftCertificateExpireTime,
	)
	return i, err
}

const attendeePaymentDetails = `-- name: AttendeePaymentDetails :one
SELECT user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       s.pay_to_user,
       payto.phone      as pay_to_phone,
       m.title::varchar as movie_title
FROM attendees a
         left outer join showings s on s.id = a.showing_id
         left join movies m on m.id = s.movie_id
         left join users payto on payto.id = s.pay_to_user
WHERE a.showing_id = $1
  AND a.user_id = $2
`

type AttendeePaymentDetailsParams struct {
	ShowingID uuid.UUID `json:"showingID"`
	UserID    uuid.UUID `json:"userID"`
}

type AttendeePaymentDetailsRow struct {
	UserID       uuid.UUID      `json:"userID"`
	ShowingID    uuid.UUID      `json:"showingID"`
	HasPaid      bool           `json:"hasPaid"`
	AmountOwed   int32          `json:"amountOwed"`
	AttendeeType string         `json:"attendeeType"`
	PayToUser    uuid.NullUUID  `json:"payToUser"`
	PayToPhone   sql.NullString `json:"payToPhone"`
	MovieTitle   string         `json:"movieTitle"`
}

func (q *Queries) AttendeePaymentDetails(ctx context.Context, arg AttendeePaymentDetailsParams) (AttendeePaymentDetailsRow, error) {
	row := q.db.QueryRow(ctx, attendeePaymentDetails, arg.ShowingID, arg.UserID)
	var i AttendeePaymentDetailsRow
	err := row.Scan(
		&i.UserID,
		&i.ShowingID,
		&i.HasPaid,
		&i.AmountOwed,
		&i.AttendeeType,
		&i.PayToUser,
		&i.PayToPhone,
		&i.MovieTitle,
	)
	return i, err
}

const deleteAttendee = `-- name: DeleteAttendee :execrows
delete
from attendees
where user_id = $1
  AND showing_id = $2
`

type DeleteAttendeeParams struct {
	UserID    uuid.UUID `json:"userID"`
	ShowingID uuid.UUID `json:"showingID"`
}

func (q *Queries) DeleteAttendee(ctx context.Context, arg DeleteAttendeeParams) (int64, error) {
	result, err := q.db.Exec(ctx, deleteAttendee, arg.UserID, arg.ShowingID)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const listAttendees = `-- name: ListAttendees :many
SELECT a.user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       gift_certificate_used,
       u.filmstaden_membership_id,
       gc.number      as gift_certificate_number,
       gc.expire_time as gift_certificate_expire_time
FROM attendees a
         left join users u on u.id = a.user_id
         left outer join showings s on s.id = a.showing_id
         left outer join gift_certificate gc on gc.user_id = a.user_id and gc.number = a.gift_certificate_used
WHERE a.showing_id = $1
  AND s.admin = $2
`

type ListAttendeesParams struct {
	ShowingID uuid.UUID `json:"showingID"`
	AdminID   uuid.UUID `json:"adminID"`
}

type ListAttendeesRow struct {
	UserID                    uuid.UUID      `json:"userID"`
	ShowingID                 uuid.UUID      `json:"showingID"`
	HasPaid                   bool           `json:"hasPaid"`
	AmountOwed                int32          `json:"amountOwed"`
	AttendeeType              string         `json:"attendeeType"`
	GiftCertificateUsed       sql.NullString `json:"giftCertificateUsed"`
	FilmstadenMembershipID    sql.NullString `json:"filmstadenMembershipID"`
	GiftCertificateNumber     sql.NullString `json:"giftCertificateNumber"`
	GiftCertificateExpireTime sql.NullTime   `json:"giftCertificateExpireTime"`
}

func (q *Queries) ListAttendees(ctx context.Context, arg ListAttendeesParams) ([]ListAttendeesRow, error) {
	rows, err := q.db.Query(ctx, listAttendees, arg.ShowingID, arg.AdminID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListAttendeesRow
	for rows.Next() {
		var i ListAttendeesRow
		if err := rows.Scan(
			&i.UserID,
			&i.ShowingID,
			&i.HasPaid,
			&i.AmountOwed,
			&i.AttendeeType,
			&i.GiftCertificateUsed,
			&i.FilmstadenMembershipID,
			&i.GiftCertificateNumber,
			&i.GiftCertificateExpireTime,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const markGCAttendeesAsHavingPaid = `-- name: MarkGCAttendeesAsHavingPaid :execrows
UPDATE attendees a
SET has_paid    = true,
    amount_owed = 0,
    update_time = current_timestamp
FROM showings s
WHERE a.showing_id = s.id
  AND s.admin = $1
  AND a.showing_id = $2
  AND (a.gift_certificate_used IS NOT NULL OR a.user_id = $1)
`

type MarkGCAttendeesAsHavingPaidParams struct {
	AdminID   uuid.UUID `json:"adminID"`
	ShowingID uuid.UUID `json:"showingID"`
}

func (q *Queries) MarkGCAttendeesAsHavingPaid(ctx context.Context, arg MarkGCAttendeesAsHavingPaidParams) (int64, error) {
	result, err := q.db.Exec(ctx, markGCAttendeesAsHavingPaid, arg.AdminID, arg.ShowingID)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const updateAmountOwedForSwishAttendees = `-- name: UpdateAmountOwedForSwishAttendees :execrows
UPDATE attendees a
SET amount_owed = $1,
    update_time = current_timestamp
FROM showings s
WHERE a.showing_id = s.id
  AND s.admin = $2
  AND a.showing_id = $3
  AND a.gift_certificate_used IS NULL
  AND has_paid = false
`

type UpdateAmountOwedForSwishAttendeesParams struct {
	AmountOwed int32     `json:"amountOwed"`
	AdminID    uuid.UUID `json:"adminID"`
	ShowingID  uuid.UUID `json:"showingID"`
}

func (q *Queries) UpdateAmountOwedForSwishAttendees(ctx context.Context, arg UpdateAmountOwedForSwishAttendeesParams) (int64, error) {
	result, err := q.db.Exec(ctx, updateAmountOwedForSwishAttendees, arg.AmountOwed, arg.AdminID, arg.ShowingID)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const updateAttendeePayment = `-- name: UpdateAttendeePayment :exec
update attendees
set has_paid    = $1,
    amount_owed = $2,
    update_time = current_timestamp
where user_id = $3
  AND showing_id = $4
`

type UpdateAttendeePaymentParams struct {
	HasPaid    bool      `json:"hasPaid"`
	AmountOwed int32     `json:"amountOwed"`
	UserID     uuid.UUID `json:"userID"`
	ShowingID  uuid.UUID `json:"showingID"`
}

func (q *Queries) UpdateAttendeePayment(ctx context.Context, arg UpdateAttendeePaymentParams) error {
	_, err := q.db.Exec(ctx, updateAttendeePayment,
		arg.HasPaid,
		arg.AmountOwed,
		arg.UserID,
		arg.ShowingID,
	)
	return err
}
