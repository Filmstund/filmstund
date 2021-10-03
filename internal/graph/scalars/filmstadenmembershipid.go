package scalars

import (
	"database/sql"
	"fmt"
	"io"
)

type FilmstadenMembershipID string

func NewFilmstadenMembershipID(str sql.NullString) *FilmstadenMembershipID {
	if str.Valid {
		id := FilmstadenMembershipID(str.String)
		return &id
	}
	return nil
}

func (f *FilmstadenMembershipID) Valid() bool {
	if f == nil {
		return true
	}

	// TODO: add validation
	// https://github.com/Filmstund/filmstund/blob/feature/postgres/backend/api/src/main/kotlin/se/filmstund/domain/id/FilmstadenMembershipId.kt#L10
	return true
}

func (f *FilmstadenMembershipID) String() string {
	if f == nil {
		return ""
	}
	return string(*f)
}

func (f *FilmstadenMembershipID) UnmarshalGQL(v interface{}) error {
	if str, ok := v.(string); ok {
		id := FilmstadenMembershipID(str)
		if !id.Valid() {
			return fmt.Errorf("invalid format for the Filmstaden membership ID")
		}

		*f = id
		return nil
	}
	return fmt.Errorf("FilmstadenMembershipID must be a string, got %T", v)
}

func (f *FilmstadenMembershipID) MarshalGQL(w io.Writer) {
	output := "null"
	if f != nil {
		output = fmt.Sprintf(`"%s"`, f)
	}

	if _, err := w.Write([]byte(output)); err != nil {
		return
	}
}
