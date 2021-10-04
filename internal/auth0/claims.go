package auth0

import (
	"crypto/subtle"

	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/golang-jwt/jwt/v4"
)

// Claims represents the claims issues by Auth0 for their access tokens.
type Claims struct {
	Subject         principal.Subject `json:"sub,omitempty"`
	AuthorizedParty string            `json:"azp,omitempty"`
	Scope           string            `json:"scope,omitempty"`
	jwt.RegisteredClaims
}

// VerifyIssuer checks that the 'iss' claims matches the supplied string (in constant time).
func (c *Claims) VerifyIssuer(iss string) bool {
	return subtle.ConstantTimeCompare([]byte(c.Issuer), []byte(iss)) == 1
}
