package security_test

import (
	"strings"
	"testing"

	"github.com/filmstund/filmstund/internal/security"
	"gotest.tools/v3/assert"
	"gotest.tools/v3/assert/cmp"
)

func Test_randBase64String(t *testing.T) {
	const n = 96
	base64String := security.RandBase64String(n)
	assert.Assert(t, cmp.Len(base64String, 4*(n/3)))
	assert.Check(t, !strings.Contains(base64String, "="))
}
