package codeflow

import (
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"fmt"

	"github.com/filmstund/filmstund/internal/security"
)

const codeVerifierSize = 96 // in bytes (should equal between 43 and 128 chars when base64 encoded, RFC 7636)

type (
	State        []byte
	CodeVerifier []byte
	Nonce        []byte
	RedirectURL  string

	Verification struct {
		Nonce        Nonce
		RedirectURL  RedirectURL
		CodeVerifier CodeVerifier
	}
)

func NewCodeVerifier() CodeVerifier {
	return security.RandBytes(codeVerifierSize)
}

// Challenge creates a challenge from this code verifier.
func (cv *CodeVerifier) Challenge() string {
	sum := sha256.Sum256([]byte(cv.String()))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

// String returns the code verifier as base64 encoded string.
func (cv CodeVerifier) String() string {
	return base64.RawURLEncoding.EncodeToString(cv)
}

// NewState constructs an encrypted state based on the given parameters.
func NewState(gcm cipher.AEAD, nonce Nonce, codeVerifier CodeVerifier, redirectURL RedirectURL) State {
	plaintext := make([]byte, len(codeVerifier)+len(redirectURL)) // nonce will be added before ciphertext
	copy(plaintext[:len(codeVerifier)], codeVerifier)
	copy(plaintext[len(codeVerifier):], redirectURL)

	ciphertext := gcm.Seal(nil, nonce, plaintext, nil)
	state := make([]byte, len(nonce)+len(ciphertext))
	copy(state, nonce)
	copy(state[len(nonce):], ciphertext)
	return state
}

func StateFromBase64(s string) (State, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

// String returns the state as a base64 encoded string.
func (s State) String() string {
	return base64.RawURLEncoding.EncodeToString(s)
}

// Nonce extracts the nonce from the state.
// Basically returns a slice of the first 12 bytes.
func (s State) Nonce(gcm cipher.AEAD) []byte {
	return s[:gcm.NonceSize()]
}

// Open decrypts the state and returns the contents in cleartext.
func (s State) Open(gcm cipher.AEAD) (Verification, error) {
	nonce := s.Nonce(gcm)
	ciphertext := s[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return Verification{}, fmt.Errorf("failed to decrypt state: %w", err)
	}

	// Code verifier goes first and the rest is the URL
	var (
		codeVer     = CodeVerifier(plaintext[:codeVerifierSize])
		redirectURL = RedirectURL(plaintext[codeVerifierSize:])
	)

	return Verification{
		Nonce:        nonce,
		RedirectURL:  redirectURL,
		CodeVerifier: codeVer,
	}, nil
}

// NewNonce generates a new random nonce with the given size.
func NewNonce(size int) Nonce {
	return security.RandBytes(size)
}

// String returns the nonce as a base64 encoded string.
func (n Nonce) String() string {
	return base64.RawURLEncoding.EncodeToString(n)
}
