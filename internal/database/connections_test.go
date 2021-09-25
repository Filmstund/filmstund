package database

import (
	"context"
	"testing"

	"gotest.tools/v3/assert"
)

func TestNew_invalid_connection(t *testing.T) {
	t.Parallel()
	_, err := New(context.TODO(), nil)
	if err == nil {
		t.Fatalf("expected err, got none")
	}
	assert.ErrorContains(t, err, "failed to initiate database connection pool: failed to connect to")
}
