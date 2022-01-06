package dao

import "database/sql"

func nullString(s sql.NullString) *string {
	if s.Valid {
		return &s.String
	}
	return nil
}
