package dao

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/filmstund/filmstund/internal/graph/model"
)

func (m *Movie) GraphMovie() *model.Movie {
	tostr := func(s sql.NullString) *string {
		if s.Valid {
			return &s.String
		}
		return nil
	}
	fromint64 := func(i sql.NullInt64) *string {
		if i.Valid {
			s := strconv.FormatInt(i.Int64, 10)
			return &s
		}
		return nil
	}
	fromint32 := func(i sql.NullInt32) *int {
		if i.Valid {
			i2 := int(i.Int32)
			return &i2
		}
		return nil
	}
	fromtime := func(t sql.NullTime) string {
		if t.Valid {
			t.Time.Format("2006-01-02")
		}
		return "1970-01-01"
	}
	runtime := "0"
	if m.Runtime.Valid {
		runtime = time.Duration(m.Runtime.Int64).String()
	}
	return &model.Movie{
		ID:             m.ID.String(),
		FilmstadenID:   tostr(m.FilmstadenID),
		ImdbID:         tostr(m.ImdbID),
		TmdbID:         fromint64(m.TmdbID),
		Slug:           tostr(m.Slug),
		Title:          m.Title,
		ReleaseDate:    fromtime(m.ReleaseDate),
		ProductionYear: fromint32(m.ProductionYear),
		Runtime:        runtime,
		Poster:         tostr(m.Poster),
		Genres:         m.Genres,
		Archived:       m.Archived,
		UpdateTime:     m.UpdateTime.Format(time.RFC3339Nano),
		CreateTime:     m.CreateTime.Format(time.RFC3339Nano),
	}
}
