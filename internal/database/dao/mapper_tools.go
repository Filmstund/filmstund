package dao

import "database/sql"

func NullString(s sql.NullString) *string {
	if s.Valid {
		return &s.String
	}
	return nil
}
