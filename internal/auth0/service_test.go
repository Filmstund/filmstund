package auth0

import (
	"strings"
	"testing"

	"gotest.tools/v3/assert"
	"gotest.tools/v3/assert/cmp"
)

func Test_randBase64String(t *testing.T) {
	const n = 96
	base64String := randBase64String(n)
	assert.Assert(t, cmp.Len(base64String, 4*(n/3)))
	assert.Check(t, !strings.Contains(base64String, "="))
}
