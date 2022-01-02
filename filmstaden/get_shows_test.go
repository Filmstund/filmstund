package filmstaden_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/filmstund/filmstund/filmstaden"
	"gotest.tools/v3/assert"
	"gotest.tools/v3/assert/cmp"
)

func TestClient_Shows(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		page := strings.Split(r.URL.Path, "/")[4]
		cityAlias := r.URL.Query()["filter.cityAlias"][0]
		filepath := fmt.Sprintf("testdata/shows-stripped_%s_%s.json", page, cityAlias)
		file, err := os.ReadFile(filepath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = w.Write(file)
		assert.NilError(t, err)
	}))
	defer srv.Close()

	t.Run("happy path", func(t *testing.T) {
		client := filmstaden.NewClient(srv.URL)
		shows, err := client.Shows(context.Background(), 1, "GB")
		assert.NilError(t, err)
		assert.Equal(t, shows.TotalCount, 604)
		assert.Check(t, cmp.Len(shows.Items, shows.TotalCount))
		s := shows.Items[0]
		assert.Equal(t, s.RemoteEntityID, "20220102-1030-1572")
		assert.Equal(t, s.MovieID, "NCG667414")
		assert.Equal(t, s.MovieVersionID, "NCG667414V1")
		assert.Equal(t, s.CinemaID, "NCG12773")
		assert.Equal(t, s.CinemaTitle, "Filmstaden Bergakungen")
		assert.Equal(t, s.ScreenID, "NCG12773S4")
		assert.Equal(t, s.ScreenTitle, "Salong 4")
		assert.Check(t, cmp.Len(s.ScreenAttributes, 0))
		assert.Equal(t, s.UTC, time.Date(2022, 1, 2, 9, 30, 0, 0, time.UTC))
		assert.Check(t, cmp.Len(s.Restrictions, 0))
		movieIDs := shows.UniqueMovieIDs()
		assert.Check(t, cmp.Len(movieIDs, 33))
	})
}

func TestClient_Shows_error(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "apa bepa", http.StatusInternalServerError)
	}))
	defer srv.Close()
	client := filmstaden.NewClient(srv.URL)
	shows, err := client.Shows(context.Background(), 2, "SE")
	assert.Check(t, cmp.Nil(shows))
	assert.ErrorContains(t, err, "error fetching Filmstaden shows, got 500 Internal Server Error")
}
