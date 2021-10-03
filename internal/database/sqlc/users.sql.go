// Code generated by sqlc. DO NOT EDIT.
// source: users.sql

package sqlc

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const newOrExistingUser = `-- name: NewOrExistingUser :one
WITH neworexisting AS (
    INSERT INTO users
        (subject_id, first_name, last_name, nick, email, avatar)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (subject_id) DO
            UPDATE SET
                last_login = current_timestamp,
                last_modified_date = current_timestamp,
                avatar = $6,
                first_name = $2,
                email = $5
        RETURNING id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
)
SELECT id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
FROM neworexisting
`

type NewOrExistingUserParams struct {
	Subject   string         `json:"subject"`
	FirstName string         `json:"firstName"`
	LastName  string         `json:"lastName"`
	Nick      sql.NullString `json:"nick"`
	Email     string         `json:"email"`
	Avatar    sql.NullString `json:"avatar"`
}

type NewOrExistingUserRow struct {
	ID                     uuid.UUID      `json:"id"`
	SubjectID              string         `json:"subjectID"`
	FilmstadenMembershipID sql.NullString `json:"filmstadenMembershipID"`
	FirstName              string         `json:"firstName"`
	LastName               string         `json:"lastName"`
	Nick                   sql.NullString `json:"nick"`
	Email                  string         `json:"email"`
	Phone                  sql.NullString `json:"phone"`
	Avatar                 sql.NullString `json:"avatar"`
	CalendarFeedID         uuid.NullUUID  `json:"calendarFeedID"`
	LastLogin              time.Time      `json:"lastLogin"`
	SignupDate             time.Time      `json:"signupDate"`
	LastModifiedDate       time.Time      `json:"lastModifiedDate"`
}

func (q *Queries) NewOrExistingUser(ctx context.Context, arg NewOrExistingUserParams) (NewOrExistingUserRow, error) {
	row := q.db.QueryRow(ctx, newOrExistingUser,
		arg.Subject,
		arg.FirstName,
		arg.LastName,
		arg.Nick,
		arg.Email,
		arg.Avatar,
	)
	var i NewOrExistingUserRow
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
