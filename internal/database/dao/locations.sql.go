// Code generated by sqlc. DO NOT EDIT.
// source: locations.sql

package dao

import (
	"context"
)

const previouslyUsedLocations = `-- name: PreviouslyUsedLocations :many
select location
from showings
group by location
order by count(location) DESC
`

func (q *Queries) PreviouslyUsedLocations(ctx context.Context) ([]string, error) {
	rows, err := q.db.Query(ctx, previouslyUsedLocations)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var location string
		if err := rows.Scan(&location); err != nil {
			return nil, err
		}
		items = append(items, location)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}