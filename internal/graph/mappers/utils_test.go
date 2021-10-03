package mappers

import (
	"testing"

	"github.com/filmstund/filmstund/internal/site"
	"github.com/google/uuid"
	"gotest.tools/v3/assert"
)

func Test_toCalendarURL(t *testing.T) {
	tests := []struct {
		name    string
		rndUUID string
		scheme  string
		host    string
		prefix  string
		wanted  string
	}{
		{
			name:    "Happy case",
			rndUUID: "2936d5e5-e74d-4730-b8a6-eb6c072d3a6a",
			scheme:  "https",
			host:    "my.example.org",
			prefix:  "/calendar/ical",
			wanted:  "https://my.example.org/calendar/ical/2936d5e5-e74d-4730-b8a6-eb6c072d3a6a",
		},
		{
			name:    "Trailing slash",
			rndUUID: "2fc4026f-c2aa-49d8-9549-3d8eb058e1f5",
			scheme:  "https",
			host:    "my.example.org",
			prefix:  "/calendar/ical/",
			wanted:  "https://my.example.org/calendar/ical/2fc4026f-c2aa-49d8-9549-3d8eb058e1f5",
		},
		{
			name:    "No slash at beginning",
			rndUUID: "e797d3a8-ecf9-456c-bd0b-077301c5be27",
			scheme:  "http",
			host:    "example.org",
			prefix:  "calendar/ical",
			wanted:  "http://example.org/calendar/ical/e797d3a8-ecf9-456c-bd0b-077301c5be27",
		},
		{
			name:    "With port",
			rndUUID: "e797d3a8-ecf9-456c-bd0b-077301c5be27",
			scheme:  "http",
			host:    "localhost:8080",
			prefix:  "calendar/ical",
			wanted:  "http://localhost:8080/calendar/ical/e797d3a8-ecf9-456c-bd0b-077301c5be27",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parsed, err := uuid.Parse(tt.rndUUID)
			assert.NilError(t, err)
			u := uuid.NullUUID{
				UUID:  parsed,
				Valid: true,
			}

			actual := toCalendarURL(u, site.Config{
				Host:              tt.host,
				Scheme:            tt.scheme,
				CalendarURLPrefix: tt.prefix,
			})

			assert.Equal(t, *actual, tt.wanted)
		})
	}
}

func Test_toCalendarURL_withNull(t *testing.T) {
	t.Run("With nil input", func(t *testing.T) {
		u := uuid.NullUUID{
			UUID:  uuid.Nil,
			Valid: false,
		}

		actual := toCalendarURL(u, site.Config{
			Host:              "doesnt-matter",
			Scheme:            "n/a",
			CalendarURLPrefix: "apa",
		})

		if actual != nil {
			t.Fail()
		}
	})
}
