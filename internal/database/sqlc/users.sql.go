// Code generated by sqlc. DO NOT EDIT.
// source: users.sql

package sqlc

import (
	"context"
	"database/sql"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users
    (subject_id, first_name, last_name, nick, email, avatar)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (subject_id) DO UPDATE SET last_login         = current_timestamp,
                                       last_modified_date = current_timestamp
RETURNING id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
`

type CreateUserParams struct {
	Subject   string         `json:"subject"`
	FirstName string         `json:"firstName"`
	LastName  string         `json:"lastName"`
	Nick      sql.NullString `json:"nick"`
	Email     string         `json:"email"`
	Avatar    sql.NullString `json:"avatar"`
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRow(ctx, createUser,
		arg.Subject,
		arg.FirstName,
		arg.LastName,
		arg.Nick,
		arg.Email,
		arg.Avatar,
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

const updateLoginTimes = `-- name: UpdateLoginTimes :one
UPDATE users
SET avatar             = $1,
    last_login         = current_timestamp,
    last_modified_date = current_timestamp
WHERE subject_id = $2
returning id, subject_id, filmstaden_membership_id, first_name, last_name, nick, email, phone, avatar, calendar_feed_id, last_login, signup_date, last_modified_date
`

type UpdateLoginTimesParams struct {
	Avatar    sql.NullString `json:"avatar"`
	SubjectID string         `json:"subjectID"`
}

func (q *Queries) UpdateLoginTimes(ctx context.Context, arg UpdateLoginTimesParams) (User, error) {
	row := q.db.QueryRow(ctx, updateLoginTimes, arg.Avatar, arg.SubjectID)
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
