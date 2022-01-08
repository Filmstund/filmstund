package graph

import (
	"context"
	"testing"
)

func Test_validateTicketURL(t *testing.T) {
	tests := []struct {
		name string
		url  string
		want bool
	}{
		{
			name: "newer format",
			url:  "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/20211220-1810-1047/5BZZVDHC9SNS",
			want: true,
		},
		{
			name: "older format",
			url:  "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6",
			want: true,
		},
		{
			name: "missing third ID",
			url:  "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/",
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validateTicketURL(context.Background(), tt.url); got != tt.want {
				t.Errorf("validateTicketURL() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_splitTicketIDs(t *testing.T) {
	tests := []struct {
		name         string
		url          string
		wantSysID    string
		wantShowID   string
		wantTicketID string
	}{
		{
			name:         "newer format",
			url:          "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/20211220-1810-1047/5BZZVDHC9SNS",
			wantSysID:    "Sys99-SE",
			wantShowID:   "20211220-1810-1047",
			wantTicketID: "5BZZVDHC9SNS",
		},
		{
			name:         "older format",
			url:          "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930/RE-99RBBT0ZP6",
			wantSysID:    "Sys99-SE",
			wantShowID:   "AA-1036-201908221930",
			wantTicketID: "RE-99RBBT0ZP6",
		},
		{
			name:         "wrong format",
			url:          "https://www.filmstaden.se/bokning/mina-e-biljetter/Sys99-SE/AA-1036-201908221930",
			wantSysID:    "",
			wantShowID:   "",
			wantTicketID: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotSysID, gotShowID, gotTicketID := splitTicketIDs(tt.url)
			if gotSysID != tt.wantSysID {
				t.Errorf("splitTicketIDs() gotSysID = %v, want %v", gotSysID, tt.wantSysID)
			}
			if gotShowID != tt.wantShowID {
				t.Errorf("splitTicketIDs() gotShowID = %v, want %v", gotShowID, tt.wantShowID)
			}
			if gotTicketID != tt.wantTicketID {
				t.Errorf("splitTicketIDs() gotTicketID = %v, want %v", gotTicketID, tt.wantTicketID)
			}
		})
	}
}
