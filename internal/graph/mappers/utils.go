package mappers

import "database/sql"

func toString(v sql.NullString) *string {
	if v.Valid {
		return &v.String
	}
	return nil
}

func fromStringP(str *string) string {
	if str == nil {
		return ""
	}
	return *str
}
