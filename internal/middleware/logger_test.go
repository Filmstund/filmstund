package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"edholm.dev/go-logging"
	"github.com/go-logr/logr"
	"gotest.tools/v3/assert"
)

func TestAttachAppLogger(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		logger logr.Logger
	}{
		{
			name:   "Default logger",
			logger: logging.DefaultLogger(),
		},
		{
			name:   "Custom logger",
			logger: logr.Discard(),
		},
	}
	for _, tt := range tests {
		tt := tt

		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			handlerFunc := AttachAppLogger(tt.logger)

			w := httptest.NewRecorder()
			r := http.Request{}

			var actualLogger logr.Logger
			handlerFunc(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
				actualLogger = logging.FromContext(request.Context())
				w.WriteHeader(http.StatusOK)
			})).ServeHTTP(w, &r)

			w.Flush()
			assert.Equal(t, actualLogger == tt.logger, true, "correct logger attached")
		})
	}
}
