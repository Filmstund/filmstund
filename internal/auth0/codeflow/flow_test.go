package codeflow

import (
	"bytes"
	"testing"

	"golang.org/x/oauth2"
	"gotest.tools/v3/assert"
)

func TestStateGeneration(t *testing.T) {
	client, err := NewClient("", oauth2.Config{}, nil)
	assert.NilError(t, err)

	url := RedirectURL("/showing/b0f2c9fc-05f3-426d-be5d-6d357a657fc1")
	state, nonce, verifier := client.generateVerification(url)

	actualNonce := state.Nonce(client.gcm)
	assert.Equal(t, bytes.Compare(nonce, actualNonce), 0)

	verification, err := state.Open(client.gcm)
	assert.NilError(t, err)
	assert.Equal(t, bytes.Compare(verifier, verification.CodeVerifier), 0)
	assert.Equal(t, url, verification.RedirectURL)

	newState, err := StateFromBase64(state.String())
	assert.NilError(t, err)
	assert.DeepEqual(t, newState, state)
}
