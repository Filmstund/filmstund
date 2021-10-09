package codeflow

import (
	"crypto/subtle"
	"errors"
	"fmt"
	"net/http"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/filmstund/filmstund/internal/security"
	"golang.org/x/oauth2"
)

var (
	ErrInvalidData     = errors.New("invalid data")
	ErrExchangeFailure = errors.New("token exchange failed")
)

type Client struct {
	audience  string
	oauthCfg  oauth2.Config
	verifier  *oidc.IDTokenVerifier
	pkceCache *stateCache
}

func NewClient(audience string, oauthCfg oauth2.Config, verifier *oidc.IDTokenVerifier) *Client {
	return &Client{
		audience:  audience,
		oauthCfg:  oauthCfg,
		verifier:  verifier,
		pkceCache: newPkceCache(),
	}
}

// generateVerification randomly create the State, Nonce, and CodeVerifier
// for use in the oauth2 authorization code flow.
func (c *Client) generateVerification() (State, Nonce, CodeVerifier) {
	state := State(security.RandBase64String(43))
	nonce := Nonce(security.RandBase64String(43))
	codeVerifier := NewCodeVerifier()

	c.pkceCache.Add(state, nonce, codeVerifier)
	return state, nonce, codeVerifier
}

// AuthCodeURL generates the necessary verifcation variables and
// puts them into cache and returns the auth code URL to redirect to.
func (c *Client) AuthCodeURL() string {
	state, nonce, codeVerifier := c.generateVerification()

	return c.oauthCfg.AuthCodeURL(
		state.String(),
		oidc.Nonce(nonce.String()),
		oauth2.SetAuthURLParam("audience", c.audience), // not needed if default audience is configured in tenant
		oauth2.SetAuthURLParam("code_challenge", codeVerifier.CreateChallenge()),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	)
}

// validateSate fetch the state from the query and cache and compare
// that they are equal. If equal, it will return the other verification variables.
func (c *Client) validateState(r *http.Request) (Nonce, CodeVerifier, error) {
	stateGiven := State(r.URL.Query().Get("state"))
	nonce, codeVerifier, found := c.pkceCache.Get(stateGiven)
	if !found {
		return "", "", fmt.Errorf("%w: no state in cache", ErrInvalidData)
	}

	c.pkceCache.Del(stateGiven)
	return nonce, codeVerifier, nil
}

// ExchangeCode takes the code and exchanges it for an access token and an ID token.
// Verifications and sanity checks are done along the way.
func (c *Client) ExchangeCode(r *http.Request) (*oauth2.Token, *oidc.IDToken, error) {
	nonce, codeVerifier, err := c.validateState(r)
	if err != nil {
		return nil, nil, err
	}

	code := r.URL.Query().Get("code")
	token, err := c.oauthCfg.Exchange(
		r.Context(),
		code,
		oauth2.SetAuthURLParam("code_verifier", string(codeVerifier)),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("%w: %v", ErrExchangeFailure, err)
	}

	idToken, err := c.extractIDToken(token, r)
	if err != nil {
		return nil, nil, err
	}

	if err := validateNonce(nonce, idToken); err != nil {
		return nil, nil, err
	}

	return token, idToken, err
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
	cmp := subtle.ConstantTimeCompare([]byte(idToken.Nonce), []byte(expectedNonce))
	if cmp != 1 {
		return fmt.Errorf("%w: invalid nonce", ErrInvalidData)
	}
	return nil
}
