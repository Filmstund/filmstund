package security

import (
	"crypto/subtle"

	"github.com/golang-jwt/jwt/v4"
)

// Auth0Claims represents the claims issues by Auth0 for their access tokens.
type Auth0Claims struct {
	// Auth0Claims represents the claims issues by Auth0 for their access tokens.
	AuthorizedParty string `json:"azp,omitempty"`
	jwt.RegisteredClaims
}

// VerifyIssuer checks that the 'iss' claims matches the supplied string (in constant time).
func (c *Auth0Claims) VerifyIssuer(iss string) bool {
	return subtle.ConstantTimeCompare([]byte(c.Issuer), []byte(iss)) == 1
}
