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
		client := filmstaden.NewClient(srv.URL, NoopCache())
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
	client := filmstaden.NewClient(srv.URL, NoopCache())
	shows, err := client.Shows(context.Background(), 2, "SE")
	assert.Check(t, cmp.Nil(shows))
	assert.ErrorContains(t, err, "shows: error fetching Filmstaden data, got 500 Internal Server Error")
}

const showsForMovie = `{"totalNbrOfItems":9,"items":[{"reId":"20220111-1555-1042","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG12773","ct":"Filmstaden Bergakungen","sId":"NCG12773S11","st":"Salong 11","sa":[],"utc":"2022-01-11T14:55:00Z","res":[]},{"reId":"20220111-1940-2783","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG27333","ct":"Biopalatset","sId":"NCG27333S5","st":"Salong 5","sa":["5.1"],"utc":"2022-01-11T18:40:00Z","res":[]},{"reId":"20220111-2025-1036","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG12773","ct":"Filmstaden Bergakungen","sId":"NCG12773S6","st":"Salong 6","sa":[],"utc":"2022-01-11T19:25:00Z","res":[]},{"reId":"20220112-1555-1042","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG12773","ct":"Filmstaden Bergakungen","sId":"NCG12773S11","st":"Salong 11","sa":[],"utc":"2022-01-12T14:55:00Z","res":[]},{"reId":"20220112-1940-2783","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG27333","ct":"Biopalatset","sId":"NCG27333S5","st":"Salong 5","sa":["5.1"],"utc":"2022-01-12T18:40:00Z","res":[]},{"reId":"20220112-2025-1036","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG12773","ct":"Filmstaden Bergakungen","sId":"NCG12773S6","st":"Salong 6","sa":[],"utc":"2022-01-12T19:25:00Z","res":[]},{"reId":"20220113-1555-1042","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG12773","ct":"Filmstaden Bergakungen","sId":"NCG12773S11","st":"Salong 11","sa":[],"utc":"2022-01-13T14:55:00Z","res":[]},{"reId":"20220113-1940-2783","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG27333","ct":"Biopalatset","sId":"NCG27333S5","st":"Salong 5","sa":["5.1"],"utc":"2022-01-13T18:40:00Z","res":[]},{"reId":"20220113-2025-1036","mId":"NCG522214","mvId":"NCG522214V1","cId":"NCG12773","ct":"Filmstaden Bergakungen","sId":"NCG12773S6","st":"Salong 6","sa":[],"utc":"2022-01-13T19:25:00Z","res":[]}]}`

func TestClient_ShowsForMovie(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte(showsForMovie))
		assert.NilError(t, err)
	}))
	defer srv.Close()

	client := filmstaden.NewClient(srv.URL, NoopCache())
	shows, err := client.ShowsForMovie(context.Background(), 1, "GB", "NCG522214", time.Now())
	assert.NilError(t, err)
	assert.Equal(t, shows.TotalCount, 9)
}
