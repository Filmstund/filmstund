package swish_test

import (
	"testing"

	"github.com/filmstund/filmstund/swish"
)

func TestData_URI(t *testing.T) {
	type fields struct {
		Version int
		Payee   swish.StringVal
		Amount  swish.IntVal
		Message swish.StringVal
	}
	tests := []struct {
		name    string
		fields  fields
		want    string
		wantErr bool
	}{
		{
			name: "Basic",
			fields: fields{
				Version: 1,
				Payee:   swish.StringVal{Value: "073-0000000"},
				Amount:  swish.IntVal{Value: 125},
				Message: swish.StringVal{Value: "apa", Editable: true},
			},
			want:    "swish://payment?data=%7B%22version%22:1%2C%22payee%22:%7B%22value%22:%22073-0000000%22%2C%22editable%22:false%7D%2C%22amount%22:%7B%22value%22:125%2C%22editable%22:false%7D%2C%22message%22:%7B%22value%22:%22apa%22%2C%22editable%22:true%7D%7D",
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data := swish.Data{
				Version: tt.fields.Version,
				Payee:   tt.fields.Payee,
				Amount:  tt.fields.Amount,
				Message: tt.fields.Message,
			}
			got, err := data.URI()
			if (err != nil) != tt.wantErr {
				t.Errorf("URI() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("URI() got = %v, want %v", got, tt.want)
			}
		})
	}
}
