package filmstaden

import (
	"context"
	"fmt"
	"time"
)

type Ticket struct {
	ID                     string `json:"id"`
	ReferenceNumber        string `json:"referenceNumber"`
	ProfileID              string `json:"profileId"`
	CustomerTypeDefinition string `json:"customerTypeDefinition"`
	CustomerType           string `json:"customerType"`
	AgeGroup               string `json:"ageGroup"`
	QrCode                 string `json:"qrCode"`
	ToiletCode             string `json:"toiletCode"`
	IsRefunded             bool   `json:"isRefunded"`
	Cinema                 struct {
		Title   string `json:"title"`
		Company struct {
			Name   string `json:"name"`
			Images []struct {
				URL  string `json:"url"`
				Type string `json:"type"`
			} `json:"images"`
		} `json:"company"`
		City struct {
			Name interface{} `json:"name"`
		} `json:"city"`
	} `json:"cinema"`
	Movie struct {
		Title  string `json:"title"`
		Rating struct {
			DisplayName string `json:"displayName"`
		} `json:"rating"`
	} `json:"movie"`
	Show struct {
		RemoteEntityID  string    `json:"remoteEntityId"`
		Date            string    `json:"date"`
		Time            string    `json:"time"`
		ShowDateTimeUtc time.Time `json:"showDateTimeUtc"`
		Unnumbered      bool      `json:"unnumbered"`
		Attributes      []struct {
			DisplayName string `json:"displayName"`
		} `json:"attributes"`
	} `json:"show"`
	Seat struct {
		Row            int    `json:"row"`
		Number         int    `json:"number"`
		Section        string `json:"section"`
		Type           string `json:"type"`
		UnnumberedText string `json:"unnumberedText"`
	} `json:"seat"`
	Screen struct {
		Title string `json:"title"`
	} `json:"screen"`
	Receipt struct {
		Net             string `json:"net"`
		Vat             string `json:"vat"`
		Total           string `json:"total"`
		TransactionDate string `json:"transactionDate"`
		TransactionTime string `json:"transactionTime"`
		InfoText        string `json:"infoText"`
	} `json:"receipt"`
	Labels struct {
		Show struct {
			Date string `json:"date"`
			Time string `json:"time"`
		} `json:"show"`
		Seat struct {
			Row     string `json:"row"`
			Number  string `json:"number"`
			Section string `json:"section"`
		} `json:"seat"`
		Screen struct {
			Title string `json:"title"`
		} `json:"screen"`
		Receipt struct {
			Net   string `json:"net"`
			Vat   string `json:"vat"`
			Total string `json:"total"`
		} `json:"receipt"`
	} `json:"labels"`
	Products []interface{} `json:"products"`
}

func (client *Client) Tickets(ctx context.Context, sysID, showingID, ticketID string) ([]Ticket, error) {
	url := fmt.Sprintf("%s/ticket/%s/%s/%s", client.baseURL, sysID, showingID, ticketID)
	tickets := make([]Ticket, 8)
	if err := client.decodedGet(ctx, url, &tickets); err != nil {
		return nil, fmt.Errorf("tickets: %w", err)
	}
	return tickets, nil
}
