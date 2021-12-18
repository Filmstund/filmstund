package security

import (
	"crypto/rand"
	"fmt"
	"io"
)

func RandBytes(size int) []byte {
	buf := make([]byte, size)
	_, err := io.ReadFull(rand.Reader, buf)
	if err != nil {
		panic(fmt.Errorf("failed to generate random bytes: %w", err))
	}

	return buf
}
