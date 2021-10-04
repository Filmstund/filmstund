package auth0

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"edholm.dev/go-logging"
	"github.com/filmstund/filmstund/internal/auth0/principal"
)

var errFetchFailure = errors.New("failed to fetch user information")

// FetchIDToken downloads the ID token from the userinfo endpoint.
func (s *Service) FetchIDToken(ctx context.Context) (*IDToken, error) {
	princ := principal.FromContext(ctx)
	logger := logging.FromContext(ctx)

	userinfoReq, err := http.NewRequestWithContext(ctx, http.MethodGet, s.cfg.UserinfoURL, nil)
	if err != nil {
		logger.Infow("failed to construct request to /userinfo", "err", err, "url", s.cfg.UserinfoURL)
		return nil, errFetchFailure
	}
	userinfoReq.Header.Add("Authorization", fmt.Sprintf("Bearer %s", princ.Token.Raw))

	// TODO: implement retries in case of rate limiting.
	resp, err := http.DefaultClient.Do(userinfoReq)
	if err != nil {
		logger.Infow("GET /userinfo failed", "err", err, "url", s.cfg.UserinfoURL)
		return nil, errFetchFailure
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Infow("non-200 status code when fetching /userinfo", "code", resp.Status)
		return nil, errFetchFailure
	}

	buf, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Infow("failed to read response body", "err", err)
		return nil, errFetchFailure
	}

	var idToken IDToken
	if err := json.Unmarshal(buf, &idToken); err != nil {
		logger.Infow("failed to unmarshal ID token", "err", err)
		return nil, errFetchFailure
	}

	return &idToken, nil
}

// IDToken as returned by the /userinfo endpoint.
type IDToken struct {
	Sub           string    `json:"sub"`
	GivenName     string    `json:"given_name"`
	FamilyName    string    `json:"family_name"`
	Nickname      string    `json:"nickname"`
	Name          string    `json:"name"`
	Picture       string    `json:"picture"`
	Locale        string    `json:"locale"`
	UpdatedAt     time.Time `json:"updated_at"`
	Email         string    `json:"email"`
	EmailVerified bool      `json:"email_verified"`
}
