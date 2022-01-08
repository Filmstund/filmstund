package filmstaden_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/filmstund/filmstund/filmstaden"
	"gotest.tools/v3/assert"
)

const barcodeResp = `"data:image/jpeg;base64,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"`

func TestClient_Barcode(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte(barcodeResp))
		assert.NilError(t, err)
	}))
	defer srv.Close()

	client := filmstaden.NewClient(srv.URL, NoopCache())
	barcode, err := client.Barcode(context.Background(), "apabepa")
	assert.NilError(t, err)
	assert.Equal(t, *barcode, barcodeResp[1:len(barcodeResp)-1])
}
