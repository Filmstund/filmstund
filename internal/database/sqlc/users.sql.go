// Code generated by sqlc. DO NOT EDIT.
// source: users.sql

package sqlc

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const addGiftCertificate = `-- name: AddGiftCertificate :exec
INSERT INTO gift_certificate (user_id, number, expires_at)
values ($1, $2, $3)
`

type AddGiftCertificateParams struct {
	UserID    uuid.UUID `json:"userID"`
	Number    string    `json:"number"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (q *Queries) AddGiftCertificate(ctx context.Context, arg AddGiftCertificateParams) error {
	_, err := q.db.Exec(ctx, addGiftCertificate, arg.UserID, arg.Number, arg.ExpiresAt)
	return err
}

const createUpdateUser = `-- name: CreateUpdateUser :one
INSERT INTO users
    (subject_id, first_name, last_name, nick, email, avatar)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (subject_id) DO UPDATE SET last_login         = current_timestamp,
                                       email              = $5,
                                       avatar             = $6,
                                       last_modified_date = current_timestamp
RETURNING id
`

type CreateUpdateUserParams struct {
	Subject   string         `json:"subject"`
	FirstName string         `json:"firstName"`
	LastName  string         `json:"lastName"`
	Nick      sql.NullString `json:"nick"`
	Email     string         `json:"email"`
	Avatar    sql.NullString `json:"avatar"`
}

func (q *Queries) CreateUpdateUser(ctx context.Context, arg CreateUpdateUserParams) (uuid.UUID, error) {
	row := q.db.QueryRow(ctx, createUpdateUser,
		arg.Subject,
		arg.FirstName,
		arg.LastName,
		arg.Nick,
		arg.Email,
		arg.Avatar,
	)
	var id uuid.UUID
	err := row.Scan(&id)
	return id, err
}

const deleteGiftCertificate = `-- name: DeleteGiftCertificate :exec
DELETE
FROM gift_certificate
WHERE user_id = $1
  AND number = $2
  AND expires_at = $3
`

type DeleteGiftCertificateParams struct {
	UserID    uuid.UUID `json:"userID"`
	Number    string    `json:"number"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (q *Queries) DeleteGiftCertificate(ctx context.Context, arg DeleteGiftCertificateParams) error {
	_, err := q.db.Exec(ctx, deleteGiftCertificate, arg.UserID, arg.Number, arg.ExpiresAt)
	return err
}

const disableCalendarFeed = `-- name: DisableCalendarFeed :one
UPDATE users
SET calendar_feed_id = NULL
WHERE subject_id = $1
RETURNING id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
`

func (q *Queries) DisableCalendarFeed(ctx context.Context, subjectID string) (User, error) {
	row := q.db.QueryRow(ctx, disableCalendarFeed, subjectID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.SubjectID,
		&i.FilmstadenMembershipID,
		&i.FirstName,
		&i.LastName,
		&i.Nick,
		&i.Email,
		&i.Phone,
		&i.Avatar,
		&i.CalendarFeedID,
		&i.LastLogin,
		&i.SignupDate,
		&i.LastModifiedDate,
	)
	return i, err
}

const getGiftCertificates = `-- name: GetGiftCertificates :many
SELECT user_id, number, expires_at, created_date
FROM gift_certificate
WHERE user_id = $1
`

func (q *Queries) GetGiftCertificates(ctx context.Context, userID uuid.UUID) ([]GiftCertificate, error) {
	rows, err := q.db.Query(ctx, getGiftCertificates, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GiftCertificate
	for rows.Next() {
		var i GiftCertificate
		if err := rows.Scan(
			&i.UserID,
			&i.Number,
			&i.ExpiresAt,
			&i.CreatedDate,
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

const getUser = `-- name: GetUser :one
SELECT id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
FROM users
WHERE id = $1
`

func (q *Queries) GetUser(ctx context.Context, id uuid.UUID) (User, error) {
	row := q.db.QueryRow(ctx, getUser, id)
	var i User
	err := row.Scan(
		&i.ID,
		&i.SubjectID,
		&i.FilmstadenMembershipID,
		&i.FirstName,
		&i.LastName,
		&i.Nick,
		&i.Email,
		&i.Phone,
		&i.Avatar,
		&i.CalendarFeedID,
		&i.LastLogin,
		&i.SignupDate,
		&i.LastModifiedDate,
	)
	return i, err
}

const randomizeCalendarFeed = `-- name: RandomizeCalendarFeed :one
UPDATE users
SET calendar_feed_id = uuid_generate_v4()
WHERE subject_id = $1
RETURNING id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
`

func (q *Queries) RandomizeCalendarFeed(ctx context.Context, subjectID string) (User, error) {
	row := q.db.QueryRow(ctx, randomizeCalendarFeed, subjectID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.SubjectID,
		&i.FilmstadenMembershipID,
		&i.FirstName,
		&i.LastName,
		&i.Nick,
		&i.Email,
		&i.Phone,
		&i.Avatar,
		&i.CalendarFeedID,
		&i.LastLogin,
		&i.SignupDate,
		&i.LastModifiedDate,
	)
	return i, err
}

const updateUser = `-- name: UpdateUser :one
UPDATE users
SET filmstaden_membership_id = COALESCE(NULLIF(TRIM($1), ''), filmstaden_membership_id),
    phone                    = COALESCE(NULLIF(TRIM($2), ''), phone),
    first_name               = COALESCE(NULLIF(TRIM($3), ''), first_name),
    last_name                = COALESCE(NULLIF(TRIM($4), ''), last_name),
    nick                     = COALESCE(NULLIF(TRIM($5), ''), nick),
    last_modified_date       = current_timestamp
WHERE subject_id = $6
RETURNING id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
`

type UpdateUserParams struct {
	FilmstadenMembershipID string `json:"filmstadenMembershipID"`
	PhoneNumber            string `json:"phoneNumber"`
	FirstName              string `json:"firstName"`
	LastName               string `json:"lastName"`
	Nick                   string `json:"nick"`
	SubjectID              string `json:"subjectID"`
}

func (q *Queries) UpdateUser(ctx context.Context, arg UpdateUserParams) (User, error) {
	row := q.db.QueryRow(ctx, updateUser,
		arg.FilmstadenMembershipID,
		arg.PhoneNumber,
		arg.FirstName,
		arg.LastName,
		arg.Nick,
		arg.SubjectID,
	)
	var i User
	err := row.Scan(
		&i.ID,
		&i.SubjectID,
		&i.FilmstadenMembershipID,
		&i.FirstName,
		&i.LastName,
		&i.Nick,
		&i.Email,
		&i.Phone,
		&i.Avatar,
		&i.CalendarFeedID,
		&i.LastLogin,
		&i.SignupDate,
		&i.LastModifiedDate,
	)
	return i, err
}

const userExistsBySubject = `-- name: UserExistsBySubject :one
SELECT exists(SELECT 1 FROM users where subject_id = $1)
`

func (q *Queries) UserExistsBySubject(ctx context.Context, subjectID string) (bool, error) {
	row := q.db.QueryRow(ctx, userExistsBySubject, subjectID)
	var exists bool
	err := row.Scan(&exists)
	return exists, err
}
