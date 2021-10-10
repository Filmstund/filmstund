package security

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
)

func RandBase64String(sizeInBytes int) string {
	resultingLen := 4 * (sizeInBytes / 3)
	if resultingLen < 43 { // rfc7636#section-4.1
		sizeInBytes = 33
	}
	if resultingLen > 128 {
		sizeInBytes = 96
	}

	buf := RandBytes(sizeInBytes)
	return base64.RawURLEncoding.EncodeToString(buf)
}

func RandBytes(size int) []byte {
	buf := make([]byte, size)
	_, err := io.ReadFull(rand.Reader, buf)
	if err != nil {
		panic(fmt.Errorf("failed to generate random bytes: %w", err))
	}

	return buf
}
