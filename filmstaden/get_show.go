package filmstaden

import (
	"context"
	"fmt"
	"time"
)

type SingleShow struct {
	Time              time.Time `json:"time"`
	TimeUtc           time.Time `json:"timeUtc"`
	RemoteSystemAlias string    `json:"remoteSystemAlias"`
	RemoteEntityID    string    `json:"remoteEntityId"`
	Movie             struct {
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
		ReleaseDateInfo    string      `json:"releaseDateInfo"`
		PreReleaseDate     interface{} `json:"preReleaseDate"`
		PreReleaseDateInfo interface{} `json:"preReleaseDateInfo"`
		ReReleaseDate      interface{} `json:"reReleaseDate"`
		ReReleaseDateInfo  interface{} `json:"reReleaseDateInfo"`
		Actors             []struct {
			DisplayName string `json:"displayName"`
			FirstName   string `json:"firstName"`
			LastName    string `json:"lastName"`
		} `json:"actors"`
		Directors []struct {
			DisplayName string `json:"displayName"`
			FirstName   string `json:"firstName"`
			LastName    string `json:"lastName"`
		} `json:"directors"`
		Roles     []interface{} `json:"roles"`
		Producers []interface{} `json:"producers"`
		Genres    []struct {
			Name string `json:"name"`
		} `json:"genres"`
		Categories       []interface{} `json:"categories"`
		EntityReferences []interface{} `json:"entityReferences"`
		Rating           struct {
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
			AltText      interface{} `json:"altText"`
			Caption      interface{} `json:"caption"`
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
		SeoTitle       string `json:"seoTitle"`
		SeoDescription string `json:"seoDescription"`
		SpecialMovie   bool   `json:"specialMovie"`
	} `json:"movie"`
	MovieVersion struct {
		Title             string `json:"title"`
		Slug              string `json:"slug"`
		LanguageID        string `json:"languageId"`
		ReleaseDate       string `json:"releaseDate"`
		AudioLanguage     string `json:"audioLanguage"`
		AudioLanguageInfo struct {
			DisplayName                string `json:"displayName"`
			Alias                      string `json:"alias"`
			Name                       string `json:"name"`
			ThreeLetterISOLanguageName string `json:"threeLetterISOLanguageName"`
			Description                string `json:"description"`
		} `json:"audioLanguageInfo"`
		SubtitlesLanguage     string `json:"subtitlesLanguage"`
		SubtitlesLanguageInfo struct {
			DisplayName                string `json:"displayName"`
			Alias                      string `json:"alias"`
			Name                       string `json:"name"`
			ThreeLetterISOLanguageName string `json:"threeLetterISOLanguageName"`
			Description                string `json:"description"`
		} `json:"subtitlesLanguageInfo"`
		Attributes        []interface{} `json:"attributes"`
		NcgID             string        `json:"ncgId"`
		RemoteSystemAlias string        `json:"remoteSystemAlias"`
		RemoteEntityID    string        `json:"remoteEntityId"`
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
	} `json:"movieVersion"`
	Attributes []struct {
		Alias       string      `json:"alias"`
		DisplayName string      `json:"displayName"`
		Description interface{} `json:"description"`
	} `json:"attributes"`
	IsRestricted                bool    `json:"isRestricted"`
	Unnumbered                  bool    `json:"unnumbered"`
	CanPayWithPoints            bool    `json:"canPayWithPoints"`
	PurchaseMemberAllowed       bool    `json:"purchaseMemberAllowed"`
	PurchaseMemberAllowedStatus int     `json:"purchaseMemberAllowedStatus"`
	AuditoriumLayoutID          string  `json:"auditoriumLayoutId"`
	MainAccount                 int     `json:"mainAccount"`
	MovieVersionPrice           float64 `json:"movieVersionPrice"`
	MemberPointPrice            int     `json:"memberPointPrice"`
	Cinema                      struct {
		NcgID      string `json:"ncgId"`
		LanguageID string `json:"languageId"`
		Title      string `json:"title"`
		Company    struct {
			Name                           string `json:"name"`
			LegalName                      string `json:"legalName"`
			OrganizationNumber             string `json:"organizationNumber"`
			WebSite                        string `json:"webSite"`
			PurchaseCinemaOwnerInformation string `json:"purchaseCinemaOwnerInformation"`
			PurchaseCinemaInformation      string `json:"purchaseCinemaInformation"`
			HandicapSeatHeading            string `json:"handicapSeatHeading"`
			HandicapSeatInfo               string `json:"handicapSeatInfo"`
			HandicapPlaceHeading           string `json:"handicapPlaceHeading"`
			HandicapPlaceInfo              string `json:"handicapPlaceInfo"`
			Address                        struct {
				PhoneNumber   string      `json:"phoneNumber"`
				StreetAddress interface{} `json:"streetAddress"`
				PostalCode    string      `json:"postalCode"`
				PostalAddress string      `json:"postalAddress"`
				City          struct {
					Name  string `json:"name"`
					Alias string `json:"alias"`
				} `json:"city"`
				Country struct {
					DisplayName string `json:"displayName"`
					Name        string `json:"name"`
					Alias       string `json:"alias"`
				} `json:"country"`
				Coordinates struct {
					Latitude  float64 `json:"latitude"`
					Longitude float64 `json:"longitude"`
				} `json:"coordinates"`
			} `json:"address"`
			Alias           string `json:"alias"`
			LanguageID      string `json:"languageId"`
			ETicketSettings struct {
				SenderSettings struct {
					EmailAddress string `json:"emailAddress"`
					DisplayName  string `json:"displayName"`
				} `json:"senderSettings"`
			} `json:"eTicketSettings"`
			Images []struct {
				FileName     string      `json:"fileName"`
				Size         int         `json:"size"`
				Height       int         `json:"height"`
				Width        int         `json:"width"`
				Version      int         `json:"version"`
				AltText      string      `json:"altText"`
				Caption      string      `json:"caption"`
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
		} `json:"company"`
		Address struct {
			PhoneNumber   interface{} `json:"phoneNumber"`
			StreetAddress string      `json:"streetAddress"`
			PostalCode    string      `json:"postalCode"`
			PostalAddress string      `json:"postalAddress"`
			City          struct {
				Name  interface{} `json:"name"`
				Alias string      `json:"alias"`
			} `json:"city"`
			Country struct {
				DisplayName string `json:"displayName"`
				Name        string `json:"name"`
				Alias       string `json:"alias"`
			} `json:"country"`
			Coordinates struct {
				Latitude  float64 `json:"latitude"`
				Longitude float64 `json:"longitude"`
			} `json:"coordinates"`
		} `json:"address"`
		ShortDescription       string `json:"shortDescription"`
		LongDescription        string `json:"longDescription"`
		LongDescriptionFormats []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"longDescriptionFormats"`
		OpeningHours struct {
			Monday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"monday"`
			Tuesday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"tuesday"`
			Wednesday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"wednesday"`
			Thursday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"thursday"`
			Friday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"friday"`
			Saturday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"saturday"`
			Sunday struct {
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"sunday"`
			Deviations []struct {
				Title string `json:"title"`
				Date  struct {
					Year  int `json:"year"`
					Month int `json:"month"`
					Day   int `json:"day"`
				} `json:"date"`
				From struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"from"`
				To struct {
					Hour   int `json:"hour"`
					Minute int `json:"minute"`
				} `json:"to"`
			} `json:"deviations"`
		} `json:"openingHours"`
		ThreeDimensionalGlassesInformation interface{} `json:"threeDimensionalGlassesInformation"`
		LostAndFoundInformation            interface{} `json:"lostAndFoundInformation"`
		PurchaseInformation                interface{} `json:"purchaseInformation"`
		Images                             []struct {
			FileName     string      `json:"fileName"`
			Size         int         `json:"size"`
			Height       int         `json:"height"`
			Width        int         `json:"width"`
			Version      int         `json:"version"`
			AltText      string      `json:"altText"`
			Caption      string      `json:"caption"`
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
		Slug                  string      `json:"slug"`
		RemoteSystemAlias     string      `json:"remoteSystemAlias"`
		RemoteEntityID        string      `json:"remoteEntityId"`
		SeoTitle              string      `json:"seoTitle"`
		SeoDescription        string      `json:"seoDescription"`
		AllowHandicapSeat     bool        `json:"allowHandicapSeat"`
		AllowHandicapPlace    bool        `json:"allowHandicapPlace"`
		HeadphoneInformation  interface{} `json:"headphoneInformation"`
		WheelchairInformation string      `json:"wheelchairInformation"`
	} `json:"cinema"`
	Screen struct {
		NcgID      string `json:"ncgId"`
		Title      string `json:"title"`
		Slug       string `json:"slug"`
		LanguageID string `json:"languageId"`
		Attributes []struct {
			Alias       string      `json:"alias"`
			DisplayName string      `json:"displayName"`
			Description interface{} `json:"description"`
		} `json:"attributes"`
		SupportedMovieVersionAttributes []struct {
			Alias       string  `json:"alias"`
			DisplayName string  `json:"displayName"`
			Description *string `json:"description"`
		} `json:"supportedMovieVersionAttributes"`
		LongDescription        string `json:"longDescription"`
		LongDescriptionFormats []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"longDescriptionFormats"`
		ThreeDimensionalGlassesInformation string      `json:"threeDimensionalGlassesInformation"`
		SeatingInformation                 interface{} `json:"seatingInformation"`
		SeatCount                          int         `json:"seatCount"`
		SortOrder                          int         `json:"sortOrder"`
		RemoteSystemAlias                  string      `json:"remoteSystemAlias"`
		RemoteEntityID                     string      `json:"remoteEntityId"`
		Rating                             interface{} `json:"rating"`
		DisplayPurchaseCondition           bool        `json:"displayPurchaseCondition"`
		PurchaseScreenInformation          string      `json:"purchaseScreenInformation"`
	} `json:"screen"`
	Restrictions                        []interface{} `json:"restrictions"`
	CustomerTypes                       []interface{} `json:"customerTypes"`
	AvailableProducts                   []interface{} `json:"availableProducts"`
	AvailableCardTypes                  []string      `json:"availableCardTypes"`
	AvailableMembershipPointOptionTypes []string      `json:"availableMembershipPointOptionTypes"`
	ChildAndSeniorTypes                 struct {
		Senior struct {
			ID                    int     `json:"id"`
			NamedDiscountPublicID string  `json:"namedDiscountPublicId"`
			PublicName            string  `json:"publicName"`
			ShortPublicName       string  `json:"shortPublicName"`
			Description           string  `json:"description"`
			DiscountCode          string  `json:"discountCode"`
			Operation             string  `json:"operation"`
			ValidFrom             string  `json:"validFrom"`
			ValidTo               string  `json:"validTo"`
			Value                 float64 `json:"value"`
		} `json:"senior"`
		Child interface{} `json:"child"`
	} `json:"childAndSeniorTypes"`
	DiscountCodeAllowed bool `json:"discountCodeAllowed"`
	GiftCardAllowed     bool `json:"giftCardAllowed"`
}

func (client *Client) Show(ctx context.Context, showID string) (*SingleShow, error) {
	url := fmt.Sprintf(
		"%s/show/Sys99-SE/%s/sv",
		client.baseURL,
		showID,
	)
	show := new(SingleShow)
	if err := client.decodedGet(ctx, url, show); err != nil {
		return nil, fmt.Errorf("show: %w", err)
	}
	return show, nil
}
