package filmstaden_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
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

	client := filmstaden.NewClient(srv.URL, NoopCache())
	movies, err := client.Movies(context.Background(), []string{"apa", "bepa"})
	assert.NilError(t, err)
	assert.Equal(t, movies.TotalCount, 33) // matches how many are actually in the movies.json file
	assert.Check(t, cmp.Len(movies.Items, movies.TotalCount))
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
	client := filmstaden.NewClient(srv.URL, NoopCache())
	movies, err := client.Movies(context.Background(), []string{"apa", "bepa"})
	assert.Check(t, cmp.Nil(movies))
	assert.Error(t, err, "movies: error fetching Filmstaden data, got 500 Internal Server Error")
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

	client := filmstaden.NewClient(srv.URL, NoopCache())
	movies, err := client.UpcomingMovies(context.Background(), "GB")
	assert.NilError(t, err)
	assert.Equal(t, movies.TotalCount, 78) // matches how many are actually in the movies-upcoming.json file
	assert.Check(t, cmp.Len(movies.Items, movies.TotalCount))
	m := movies.Items[0]
	assert.Equal(t, m.Title, "Spegeln")
	assert.Equal(t, m.OriginalTitle, "Zerkalo")
	assert.Equal(t, m.ProductionYear, 1975)
	assert.Equal(t, m.ReleaseDate, "1979-11-12T00:00:00")
	assert.Equal(t, m.ReReleaseDate, "2022-01-05T11:00:00")
}

func TestMovies_Merge(t *testing.T) {
	type fields struct {
		TotalCount int
		Items      []filmstaden.Movie
	}
	tests := []struct {
		name   string
		fields fields
		other  *filmstaden.Movies
		want   *filmstaden.Movies
	}{
		{
			name: "No items",
			fields: fields{
				TotalCount: 0,
				Items:      nil,
			},
			other: nil,
			want: &filmstaden.Movies{
				TotalCount: 0,
				Items:      nil,
			},
		},
		{
			name: "No merge, single",
			fields: fields{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
				},
			},
			other: nil,
			want: &filmstaden.Movies{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
				},
			},
		},
		{
			name: "Merge",
			fields: fields{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
				},
			},
			other: &filmstaden.Movies{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "bepa"},
				},
			},
			want: &filmstaden.Movies{
				TotalCount: 2,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
					{NcgID: "bepa"},
				},
			},
		},
		{
			name: "Merge with empty",
			fields: fields{
				TotalCount: 0,
				Items:      nil,
			},
			other: &filmstaden.Movies{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "bepa"},
				},
			},
			want: &filmstaden.Movies{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "bepa"},
				},
			},
		},
		{
			name: "Merge with same",
			fields: fields{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
				},
			},
			other: &filmstaden.Movies{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
				},
			},
			want: &filmstaden.Movies{
				TotalCount: 1,
				Items: []filmstaden.Movie{
					{NcgID: "apa"},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			movies := &filmstaden.Movies{
				TotalCount: tt.fields.TotalCount,
				Items:      tt.fields.Items,
			}
			if got := movies.Merge(tt.other); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Merge() = %v, want %v", got, tt.want)
			}
		})
	}
}
