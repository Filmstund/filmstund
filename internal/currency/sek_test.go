package currency_test

import (
	"bytes"
	"testing"

	"github.com/filmstund/filmstund/internal/currency"
	"gotest.tools/v3/assert"
)

func TestSEK_String(t *testing.T) {
	tests := []struct {
		name string
		sek  currency.SEK
		want string
	}{
		{
			name: "one krona",
			sek:  1 * currency.Kronor,
			want: "1 kr",
		},
		{
			name: "one and a half krona",
			sek:  1*currency.Kronor + 50*currency.Oren,
			want: "1.5 kr",
		},
		{
			name: "one and a bit more than half a krona",
			sek:  1*currency.Kronor + 57*currency.Oren,
			want: "1.57 kr",
		},
		{
			name: "150 kr",
			sek:  150 * currency.Kronor,
			want: "150 kr",
		},
		{
			name: "0 kr",
			sek:  0 * currency.Kronor,
			want: "0 kr",
		},
		{
			name: "-2 kr",
			sek:  -2 * currency.Kronor,
			want: "-2 kr",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.sek.String(); got != tt.want {
				t.Errorf("String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestSEK_UnmarshalGQL(t *testing.T) {
	c := new(currency.SEK)
	err := c.UnmarshalGQL("12.57 kr")
	assert.NilError(t, err)
	assert.Equal(t, *c, 12*currency.Kronor+57*currency.Oren)

	err = c.UnmarshalGQL("127 kr")
	assert.NilError(t, err)
	assert.Equal(t, *c, 127*currency.Kronor)
}

func TestSEK_MarshalGQL(t *testing.T) {
	buf := new(bytes.Buffer)
	c := 12*currency.Kronor + 57*currency.Oren
	c.MarshalGQL(buf)
	assert.Equal(t, buf.String(), `"12.57 kr"`)

	buf.Reset()
	c = 127 * currency.Kronor
	c.MarshalGQL(buf)
	assert.Equal(t, buf.String(), `"127 kr"`)
}

func TestSEK_Kronor(t *testing.T) {
	tests := []struct {
		name string
		sek  currency.SEK
		want int
	}{
		{
			name: "one kronor",
			sek:  1 * currency.Kronor,
			want: 1,
		},
		{
			name: "1.5 kronor",
			sek:  1*currency.Kronor + 50*currency.Oren,
			want: 2,
		},
		{
			name: "1.4 kronor",
			sek:  1*currency.Kronor + 40*currency.Oren,
			want: 1,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.sek.Kronor(); got != tt.want {
				t.Errorf("Kronor() = %v, want %v", got, tt.want)
			}
		})
	}
}
