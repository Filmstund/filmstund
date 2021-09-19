package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"gotest.tools/assert"
)

type maintCfg struct {
	enabled bool
}

func (c *maintCfg) MaintenanceMode() bool {
	return c.enabled
}

func TestProcessMaintenance_disabled(t *testing.T) {
	t.Parallel()

	cfg := maintCfg{enabled: false}
	maintHandlerFunc := ProcessMaintenance(&cfg)

	w := httptest.NewRecorder()
	r := http.Request{}

	maintHandlerFunc(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(w, &r)

	w.Flush()
	assert.Equal(t, w.Code, http.StatusOK)
}

func TestProcessMaintenance_enabled(t *testing.T) {
	t.Parallel()

	cfg := maintCfg{enabled: true}
	maintHandlerFunc := ProcessMaintenance(&cfg)

	w := httptest.NewRecorder()
	r := http.Request{}

	maintHandlerFunc(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatalf("this shouldn't happen when maint mode is enabled")
	})).ServeHTTP(w, &r)

	w.Flush()
	assert.Equal(t, w.Code, http.StatusServiceUnavailable)
}
