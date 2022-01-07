// Code generated by sqlc. DO NOT EDIT.
// source: cinemascreen.sql

package dao

import (
	"context"
	"database/sql"
)

const addCinemaScreen = `-- name: AddCinemaScreen :exec
insert into cinema_screens (id, name)
values ($1, $2)
on conflict DO NOTHING
`

type AddCinemaScreenParams struct {
	ID   string         `json:"id"`
	Name sql.NullString `json:"name"`
}

func (q *Queries) AddCinemaScreen(ctx context.Context, arg AddCinemaScreenParams) error {
	_, err := q.db.Exec(ctx, addCinemaScreen, arg.ID, arg.Name)
	return err
}

const cinemaScreen = `-- name: CinemaScreen :one
SELECT name
from cinema_screens
WHERE id = $1
`

func (q *Queries) CinemaScreen(ctx context.Context, id string) (sql.NullString, error) {
	row := q.db.QueryRow(ctx, cinemaScreen, id)
	var name sql.NullString
	err := row.Scan(&name)
	return name, err
}
