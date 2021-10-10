package codeflow

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/subtle"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

var (
	ErrInvalidData     = errors.New("invalid data")
	ErrExchangeFailure = errors.New("token exchange failed")
)

type Client struct {
	audience string
	oauthCfg oauth2.Config
	verifier *oidc.IDTokenVerifier
	gcm      cipher.AEAD
}

func NewClient(audience string, oauthCfg oauth2.Config, verifier *oidc.IDTokenVerifier) (*Client, error) {
	// Generate random key - look this up from somewhere if we want to share
	key := make([]byte, 32) // AES-256
	_, err := io.ReadFull(rand.Reader, key)
	if err != nil {
		return nil, fmt.Errorf("failed to generate encryption key: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to setup GCM cipher: %w", err)
	}

	return &Client{
		audience: audience,
		oauthCfg: oauthCfg,
		verifier: verifier,
		gcm:      gcm,
	}, nil
}

// generateVerification randomly create the State, Nonce, and CodeVerifier
// for use in the oauth2 authorization code flow.
func (c *Client) generateVerification(redirectURL RedirectURL) (State, Nonce, CodeVerifier) {
	// TODO: Check max length of URL?
	var (
		nonce        = NewNonce(c.gcm.NonceSize())
		codeVerifier = NewCodeVerifier()
		state        = NewState(c.gcm, nonce, codeVerifier, redirectURL)
	)

	return state, nonce, codeVerifier
}

// AuthCodeURL generates the necessary verification variables and
// puts them into cache and returns the auth code URL to redirect to.
func (c *Client) AuthCodeURL(redirectURL RedirectURL) string {
	state, nonce, codeVerifier := c.generateVerification(redirectURL)

	return c.oauthCfg.AuthCodeURL(
		state.String(),
		oidc.Nonce(nonce.String()),
		oauth2.SetAuthURLParam("audience", c.audience),
		oauth2.SetAuthURLParam("code_challenge", codeVerifier.Challenge()),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	)
}

// validateSate fetch the state from the query and cache and compare
// that they are equal. If equal, it will return the other verification variables.
func (c *Client) validateState(r *http.Request) (Verification, error) {
	stateGiven, err := StateFromBase64(r.URL.Query().Get("state"))
	if err != nil {
		return Verification{}, fmt.Errorf("%w: %v", ErrInvalidData, err)
	}

	verification, err := stateGiven.Open(c.gcm)
	if err != nil {
		return Verification{}, fmt.Errorf("%w: %v", ErrInvalidData, err)
	}

	return verification, nil
}

// ExchangeCode takes the code and exchanges it for an access token and an ID token.
// Verifications and sanity checks are done along the way.
func (c *Client) ExchangeCode(r *http.Request) (*oauth2.Token, *oidc.IDToken, RedirectURL, error) {
	verification, err := c.validateState(r)
	if err != nil {
		return nil, nil, "", err
	}

	code := r.URL.Query().Get("code")
	token, err := c.oauthCfg.Exchange(
		r.Context(),
		code,
		oauth2.SetAuthURLParam("code_verifier", verification.CodeVerifier.String()),
	)
	if err != nil {
		return nil, nil, "", fmt.Errorf("%w: %v", ErrExchangeFailure, err)
	}

	idToken, err := c.extractIDToken(token, r)
	if err != nil {
		return nil, nil, "", err
	}

	if err := validateNonce(verification.Nonce, idToken); err != nil {
		return nil, nil, "", err
	}

	return token, idToken, verification.RedirectURL, err
}

// extractIDToken from the given access token.
func (c *Client) extractIDToken(token *oauth2.Token, r *http.Request) (*oidc.IDToken, error) {
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, fmt.Errorf("%w: wrong type for ID token", ErrInvalidData)
	}

	idToken, err := c.verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrInvalidData, err)
	}
	return idToken, err
}

// validateNonce checks that nonce we first generated and stored in cache,
// is the same one we got from the authorization server.
func validateNonce(expectedNonce Nonce, idToken *oidc.IDToken) error {
	cmp := subtle.ConstantTimeCompare([]byte(idToken.Nonce), []byte(expectedNonce.String()))
	if cmp != 1 {
		return fmt.Errorf("%w: invalid nonce", ErrInvalidData)
	}
	return nil
}
