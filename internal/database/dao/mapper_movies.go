package dao

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/filmstund/filmstund/internal/graph/model"
)

func (m *Movie) GraphModel() *model.Movie {
	fromint64 := func(i sql.NullInt64) *string {
		if i.Valid {
			s := strconv.FormatInt(i.Int64, 10)
			return &s
		}
		return nil
	}
	fromtime := func(t sql.NullTime) string {
		if t.Valid {
			return t.Time.Format("2006-01-02")
		}
		return "1970-01-01"
	}

	runtime := (time.Duration(m.Runtime) * time.Minute).String()
	return &model.Movie{
		ID:             m.ID,
		FilmstadenID:   m.FilmstadenID,
		ImdbID:         nullString(m.ImdbID),
		TmdbID:         fromint64(m.TmdbID),
		Slug:           m.Slug,
		Title:          m.Title,
		ReleaseDate:    fromtime(m.ReleaseDate),
		ProductionYear: int(m.ProductionYear),
		Runtime:        runtime,
		Poster:         nullString(m.Poster),
		Genres:         m.Genres,
		Archived:       m.Archived,
		UpdateTime:     m.UpdateTime.Format(time.RFC3339Nano),
		CreateTime:     m.CreateTime.Format(time.RFC3339Nano),
	}
}
