package graph

import (
	"encoding/base64"

	"github.com/google/uuid"
)

// combineIDs takes two UUIDs and combines them to a base64 string.
func combineIDs(first, second uuid.UUID) string {
	combined := make([]byte, 32) // 2x16 bytes of UUID.
	copy(combined, first[:])
	copy(combined[16:], second[:])
	return base64.RawURLEncoding.EncodeToString(combined)
}
