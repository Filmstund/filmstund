package auth0

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"time"

	"edholm.dev/go-logging"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/filmstund/filmstund/internal/auth0/codeflow"
	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/security"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

func NewService(ctx context.Context, cfg *Config) (*Service, error) {
	// This is using the OpenID discovery protocol to figure out well known stuff.
	provider, err := oidc.NewProvider(ctx, cfg.Issuer)
	if err != nil {
		return nil, fmt.Errorf("failed to setup OpenID Connect provider: %w", err)
	}

	return &Service{
		oauthCfg: oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  cfg.LoginCallbackURL,
			Scopes:       cfg.Scopes,
		},
		verifier:  provider.Verifier(&oidc.Config{ClientID: cfg.ClientID}),
		cfg:       cfg,
		pkceCache: codeflow.NewPkceCache(),
	}, nil
}

type Service struct {
	oauthCfg oauth2.Config
	verifier *oidc.IDTokenVerifier

	cfg *Config

	pkceCache *codeflow.PkceCache
}

func setCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	kaka := http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int((5 * time.Minute).Seconds()),
		Secure:   r.TLS != nil,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // TODO: how to use strict?
	}
	http.SetCookie(w, &kaka)
}

func (s *Service) LoginHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		state := codeflow.State(security.RandBase64String(43))
		nonce := security.RandBase64String(43)
		setCookie(w, r, "state", state.String())
		setCookie(w, r, "nonce", nonce)

		codeVerifier := codeflow.NewCodeVerifier()
		s.pkceCache.Add(state, codeVerifier)

		authURL := s.oauthCfg.AuthCodeURL(
			state.String(),
			oidc.Nonce(nonce),
			oauth2.SetAuthURLParam("audience", s.cfg.Audience), // not needed if default audience is configured in tenant
			oauth2.SetAuthURLParam("code_challenge", codeVerifier.CreateChallenge()),
			oauth2.SetAuthURLParam("code_challenge_method", "S256"),
		)
		http.Redirect(w, r, authURL, http.StatusFound)
	})
}

//nolint:cyclop
func (s *Service) LoginCallbackHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := logging.FromContext(r.Context())

		if r.URL.Query().Get("error") != "" {
			httputils.BadRequest(w, r, r.URL.Query().Get("error_description"))
			return
		}

		state, err := validateState(r)
		if err != nil {
			httputils.BadRequest(w, r, err.Error())
			return
		}

		token, err := exchangeCode(s, state, r)
		if err != nil {
			httputils.InternalServerError(w, r)
			logger.Warnw(err.Error(), "err", err)
			return
		}

		scopes, ok := token.Extra("scope").(string)
		if !ok {
			httputils.InternalServerError(w, r)
			logger.Warnw("didn't get any scopes from the access token")
			return
		}

		idToken, err := extractIDToken(token, s, r, logger)
		if err != nil {
			httputils.RespondBasedOnErr(err, w, r)
			return
		}

		err = validateNonce(r, idToken, logger)
		if err != nil {
			httputils.RespondBasedOnErr(err, w, r)
			return
		}

		// TODO: update user information from ID token
		// TODO: create a session cookie
		// TODO: redirect to /
		resp := struct {
			OAuth2Token   *oauth2.Token
			IDTokenClaims *json.RawMessage // ID Token payload is just JSON.
			Scopes        string
		}{token, new(json.RawMessage), scopes}

		if err := idToken.Claims(&resp.IDTokenClaims); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		data, err := json.MarshalIndent(resp, "", "    ")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, _ = w.Write(data)
	})
}

func extractIDToken(token *oauth2.Token, s *Service, r *http.Request, logger *zap.SugaredLogger) (*oidc.IDToken, error) {
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		logger.Warnw("didn't get an ID token from the token exchange")
		return nil, httputils.ErrInternal
	}

	idToken, err := s.verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		logger.Infow("failed to verify ID token", "err", err)
		return nil, httputils.ErrUnauthorized
	}
	return idToken, err
}

func exchangeCode(s *Service, state codeflow.State, r *http.Request) (*oauth2.Token, error) {
	codeVerifier, matchFound := s.pkceCache.Get(state)
	if !matchFound {
		return nil, fmt.Errorf("failed to find code_verifier")
	}
	s.pkceCache.Del(state)

	code := r.URL.Query().Get("code")
	token, err := s.oauthCfg.Exchange(r.Context(), code, oauth2.SetAuthURLParam("code_verifier", string(codeVerifier)))
	return token, err
}

func validateState(r *http.Request) (codeflow.State, error) {
	stateCookie, err := r.Cookie("state")
	if err != nil {
		return "", fmt.Errorf("state not found")
	}

	if r.URL.Query().Get("state") != stateCookie.Value {
		return "", fmt.Errorf("state doesn't match")
	}
	return codeflow.State(stateCookie.Value), nil
}

func validateNonce(r *http.Request, idToken *oidc.IDToken, logger *zap.SugaredLogger) error {
	nonceCookie, err := r.Cookie("nonce")
	if err != nil {
		return fmt.Errorf("%w: nonce not found", httputils.ErrBadRequest)
	}
	if idToken.Nonce != nonceCookie.Value {
		logger.Infow("nonce from cookie didn't match ID token nonce")
		return fmt.Errorf("%w: wrong nonce", httputils.ErrBadRequest)
	}

	return nil
}

func (s *Service) LogoutHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logoutURL, err := s.logoutURL()
		if err != nil {
			httputils.InternalServerError(w, r)
			logging.FromContext(r.Context()).Warnw("failed to create logout URL", "err", err)
			return
		}

		// TODO: invalidate local session state
		http.Redirect(w, r, logoutURL, http.StatusFound)
	})
}

func (s *Service) logoutURL() (string, error) {
	parsed, err := url.Parse(path.Join(s.cfg.Issuer, "/v2/logout"))
	if err != nil {
		return "", fmt.Errorf("failed to parse logout URL: %w", err)
	}

	q := parsed.Query()
	q.Add("client_id", s.cfg.ClientID)
	q.Add("returnTo", s.cfg.LogoutCallbackURL) // TODO: prodify.
	parsed.RawQuery = q.Encode()

	return parsed.String(), nil
}
