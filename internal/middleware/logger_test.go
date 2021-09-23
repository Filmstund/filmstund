package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/filmstund/filmstund/internal/logging"
	"go.uber.org/zap"
	"gotest.tools/assert"
)

func TestAttachAppLogger(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		logger *zap.SugaredLogger
	}{
		{
			name:   "Default logger",
			logger: logging.DefaultLogger(),
		},
		{
			name:   "Custom logger",
			logger: zap.NewExample().Sugar(),
		},
	}
	for _, tt := range tests {
		tt := tt

		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			handlerFunc := AttachAppLogger(tt.logger)

			w := httptest.NewRecorder()
			r := http.Request{}

			var actualLogger *zap.SugaredLogger
			handlerFunc(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
				actualLogger = logging.FromContext(request.Context())
				w.WriteHeader(http.StatusOK)
			})).ServeHTTP(w, &r)

			w.Flush()
			assert.Equal(t, actualLogger == tt.logger, true, "correct logger attached")
		})
	}
}