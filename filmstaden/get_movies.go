package filmstaden

import (
	"context"
	"fmt"
	"strings"
)

type Movie struct {
	Versions []struct {
		Title             string  `json:"title"`
		Slug              string  `json:"slug"`
		LanguageID        string  `json:"languageId"`
		ReleaseDate       string  `json:"releaseDate"`
		AudioLanguage     *string `json:"audioLanguage"`
		AudioLanguageInfo *struct {
			DisplayName                string `json:"displayName"`
			Alias                      string `json:"alias"`
			Name                       string `json:"name"`
			ThreeLetterISOLanguageName string `json:"threeLetterISOLanguageName"`
			Description                string `json:"description"`
		} `json:"audioLanguageInfo"`
		SubtitlesLanguage     *string `json:"subtitlesLanguage"`
		SubtitlesLanguageInfo *struct {
			DisplayName                string `json:"displayName"`
			Alias                      string `json:"alias"`
			Name                       string `json:"name"`
			ThreeLetterISOLanguageName string `json:"threeLetterISOLanguageName"`
			Description                string `json:"description"`
		} `json:"subtitlesLanguageInfo"`
		Attributes []struct {
			Alias       string  `json:"alias"`
			DisplayName string  `json:"displayName"`
			Description *string `json:"description"`
		} `json:"attributes"`
		NcgID             string `json:"ncgId"`
		RemoteSystemAlias string `json:"remoteSystemAlias"`
		RemoteEntityID    string `json:"remoteEntityId"`
		Rating            struct {
			DisplayName    string `json:"displayName"`
			Alias          string `json:"alias"`
			Age            int    `json:"age"`
			AgeAccompanied int    `json:"ageAccompanied"`
		} `json:"rating"`
		AudioLanguages []struct {
			DisplayName                string `json:"displayName"`
			Alias                      string `json:"alias"`
			Name                       string `json:"name"`
			ThreeLetterISOLanguageName string `json:"threeLetterISOLanguageName"`
			Description                string `json:"description"`
		} `json:"audioLanguages"`
		PartnerShow bool        `json:"partnerShow"`
		PartnerCode interface{} `json:"partnerCode"`
	} `json:"versions"`
	NcgID             string `json:"ncgId"`
	LanguageID        string `json:"languageId"`
	Title             string `json:"title"`
	OriginalTitle     string `json:"originalTitle"`
	Slug              string `json:"slug"`
	OriginalLanguage  string `json:"originalLanguage"`
	OriginalLanguages []struct {
		NativeName  string      `json:"nativeName"`
		EnglishName string      `json:"englishName"`
		DisplayName string      `json:"displayName"`
		Alias       string      `json:"alias"`
		Description interface{} `json:"description"`
	} `json:"originalLanguages"`
	ProductionYear         int    `json:"productionYear"`
	ShortDescription       string `json:"shortDescription"`
	LongDescription        string `json:"longDescription"`
	LongDescriptionFormats []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"longDescriptionFormats"`
	ReleaseDate        string      `json:"releaseDate"`
	ReleaseDateInfo    interface{} `json:"releaseDateInfo"`
	PreReleaseDate     *string     `json:"preReleaseDate"`
	PreReleaseDateInfo interface{} `json:"preReleaseDateInfo"`
	ReReleaseDate      string      `json:"reReleaseDate"`
	ReReleaseDateInfo  interface{} `json:"reReleaseDateInfo"`
	Actors             []struct {
		DisplayName string  `json:"displayName"`
		FirstName   string  `json:"firstName"`
		LastName    *string `json:"lastName"`
	} `json:"actors"`
	Directors []struct {
		DisplayName string `json:"displayName"`
		FirstName   string `json:"firstName"`
		LastName    string `json:"lastName"`
	} `json:"directors"`
	Roles []struct {
		RoleName string `json:"roleName"`
		Persons  []struct {
			DisplayName string `json:"displayName"`
			FirstName   string `json:"firstName"`
			LastName    string `json:"lastName"`
		} `json:"persons"`
	} `json:"roles"`
	Producers []interface{} `json:"producers"`
	Genres    []struct {
		Name string `json:"name"`
	} `json:"genres"`
	Categories []struct {
		Alias       string `json:"alias"`
		DisplayName string `json:"displayName"`
		SortOrder   int    `json:"sortOrder"`
	} `json:"categories"`
	EntityReferences []struct {
		EntityType string `json:"entityType"`
		Direction  string `json:"direction"`
		EntityID   string `json:"entityId"`
	} `json:"entityReferences"`
	Rating struct {
		DisplayName    string `json:"displayName"`
		Alias          string `json:"alias"`
		Age            int    `json:"age"`
		AgeAccompanied int    `json:"ageAccompanied"`
	} `json:"rating"`
	Length       int `json:"length"`
	VideoStreams []struct {
		Category    string      `json:"category"`
		URL         string      `json:"url"`
		Description string      `json:"description"`
		Image       interface{} `json:"image"`
	} `json:"videoStreams"`
	PosterURL string `json:"posterUrl"`
	Images    []struct {
		FileName     string      `json:"fileName"`
		Size         int         `json:"size"`
		Height       int         `json:"height"`
		Width        int         `json:"width"`
		Version      int         `json:"version"`
		AltText      *string     `json:"altText"`
		Caption      *string     `json:"caption"`
		Copyright    interface{} `json:"copyright"`
		ID           string      `json:"id"`
		ImageType    string      `json:"imageType"`
		ContentType  string      `json:"contentType"`
		URL          string      `json:"url"`
		Alternatives []struct {
			ContentType string `json:"contentType"`
			URL         string `json:"url"`
		} `json:"alternatives"`
	} `json:"images"`
	SeoTitle       *string `json:"seoTitle"`
	SeoDescription *string `json:"seoDescription"`
	SpecialMovie   bool    `json:"specialMovie"`
}

type Movies struct {
	TotalCount int     `json:"totalNbrOfItems"`
	Items      []Movie `json:"items"`
}

// Merge this Movies struct with another based on the movie ID (NCG ID).
func (movies *Movies) Merge(other *Movies) *Movies {
	if movies == nil && other != nil {
		return other
	} else if movies == nil || other == nil {
		return movies
	}
	set := make(map[string]Movie, movies.TotalCount+other.TotalCount)
	for _, m := range movies.Items {
		set[m.NcgID] = m
	}
	for _, m := range other.Items {
		set[m.NcgID] = m
	}

	items := make([]Movie, 0, len(set))
	for _, movie := range set {
		items = append(items, movie)
	}
	return &Movies{
		TotalCount: len(items),
		Items:      items,
	}
}

// Movies returns detailed information about the given NCG IDs.
func (client *Client) Movies(ctx context.Context, movieIDs []string) (*Movies, error) {
	joined := strings.Join(movieIDs, ",")
	url := fmt.Sprintf(
		"%s/movie/sv?movieNcgIds=%s",
		client.baseURL,
		joined,
	)

	movies := new(Movies)
	if err := client.decodedGet(ctx, url, movies); err != nil {
		return nil, fmt.Errorf("movies: %w", err)
	}
	return movies, nil
}

// UpcomingMovies returns detailed info about all movies not yet released.
func (client *Client) UpcomingMovies(ctx context.Context, cityAlias string) (*Movies, error) {
	url := fmt.Sprintf(
		"%s/movie/bytype/sv/1/1024/Upcoming/true?filter.cityAlias=%s&countryAlias=se",
		client.baseURL,
		cityAlias,
	)

	movies := new(struct {
		TotalNbrOfItems int `json:"totalNbrOfItems"`
		Items           []struct {
			NcgID string `json:"ncgId"`
		}
	})
	if err := client.decodedGet(ctx, url, movies); err != nil {
		return nil, fmt.Errorf("upcomingMovies: %w", err)
	}

	if movies.TotalNbrOfItems == 0 || len(movies.Items) == 0 {
		return &Movies{
			TotalCount: 0,
			Items:      nil,
		}, nil
	}
	ids := make([]string, len(movies.Items))
	for i, movie := range movies.Items {
		ids[i] = movie.NcgID
	}
	return client.Movies(ctx, ids)
}
