package mappers

import (
	"database/sql"
	"net/url"
	"path"

	"github.com/filmstund/filmstund/internal/site"
	"github.com/google/uuid"
)

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

func toCalendarURL(id uuid.NullUUID, siteCfg site.Config) *string {
	if !id.Valid {
		return nil
	}

	calURL := url.URL{
		Scheme: siteCfg.Scheme,
		Host:   siteCfg.Host,
		Path:   path.Join(siteCfg.CalendarURLPrefix, id.UUID.String()),
	}
	str := calURL.String()

	return &str
}

func fromUUID(nullU uuid.NullUUID) *string {
	if nullU.Valid {
		u := nullU.UUID.String()
		return &u
	}
	return nil
}
