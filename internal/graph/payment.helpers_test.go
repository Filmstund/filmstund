package graph

import (
	"encoding/base64"
	"testing"

	"github.com/google/uuid"
	"gotest.tools/v3/assert"
)

func Test_combineIDs(t *testing.T) {
	first := uuid.New()
	second := uuid.New()
	ds := combineIDs(first, second)

	reversed, err := base64.RawURLEncoding.DecodeString(ds)
	assert.NilError(t, err)
	revFirstRaw := reversed[:16]
	revSecondRaw := reversed[16:]

	revFirst, err := uuid.FromBytes(revFirstRaw)
	assert.NilError(t, err)
	revSecond, err := uuid.FromBytes(revSecondRaw)
	assert.NilError(t, err)

	assert.Equal(t, revFirst, first)
	assert.Equal(t, revSecond, second)
}
