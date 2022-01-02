package filmstaden_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/filmstund/filmstund/filmstaden"
	"gotest.tools/v3/assert"
	"gotest.tools/v3/assert/cmp"
)

func TestClient_Movies(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		file, err := os.ReadFile("testdata/movies.json")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = w.Write(file)
		assert.NilError(t, err)
	}))
	defer srv.Close()

	client := filmstaden.NewClient(srv.URL)
	movies, err := client.Movies(context.Background(), []string{"apa", "bepa"})
	assert.NilError(t, err)
	assert.Equal(t, movies.TotalNbrOfItems, 33) // matches how many are actually in the movies.json file
	assert.Check(t, cmp.Len(movies.Items, movies.TotalNbrOfItems))
	m := movies.Items[0]
	assert.Equal(t, m.Title, "Spider-Man: No Way Home")
	assert.Equal(t, m.OriginalTitle, "Spider-Man: No Way Home")
	assert.Equal(t, m.ProductionYear, 2021)
	assert.Equal(t, m.ReleaseDate, "2021-12-15T00:00:00")
}

func TestClient_Movies_error(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "slerp derp", http.StatusInternalServerError)
	}))
	defer srv.Close()
	client := filmstaden.NewClient(srv.URL)
	movies, err := client.Movies(context.Background(), []string{"apa", "bepa"})
	assert.Check(t, cmp.Nil(movies))
	assert.ErrorContains(t, err, "error fetching Filmstaden movies, got 500 Internal Server Error")
}

func TestClient_UpcomingMovies(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		filename := "testdata/movies-upcoming-detailed.json"
		if strings.HasPrefix(r.URL.Path, "movie/bytype") {
			filename = "testdata/movies-upcoming.json"
		}

		file, err := os.ReadFile(filename)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = w.Write(file)
		assert.NilError(t, err)
	}))
	defer srv.Close()

	client := filmstaden.NewClient(srv.URL)
	movies, err := client.UpcomingMovies(context.Background(), "GB")
	assert.NilError(t, err)
	assert.Equal(t, movies.TotalNbrOfItems, 78) // matches how many are actually in the movies-upcoming.json file
	assert.Check(t, cmp.Len(movies.Items, movies.TotalNbrOfItems))
	m := movies.Items[0]
	assert.Equal(t, m.Title, "Spegeln")
	assert.Equal(t, m.OriginalTitle, "Zerkalo")
	assert.Equal(t, m.ProductionYear, 1975)
	assert.Equal(t, m.ReleaseDate, "1979-11-12T00:00:00")
	assert.Equal(t, m.ReReleaseDate, "2022-01-05T11:00:00")
}
