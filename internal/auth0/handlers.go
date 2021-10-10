package auth0

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"

	"edholm.dev/go-logging"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/filmstund/filmstund/internal/auth0/codeflow"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/session"
	"golang.org/x/oauth2"
)

func NewHandler(ctx context.Context, cfg *Config, db *database.DB, sessionStorage *session.Storage) (*Handler, error) {
	// This is using the OpenID discovery protocol to figure out well known stuff.
	provider, err := oidc.NewProvider(ctx, cfg.Issuer)
	if err != nil {
		return nil, fmt.Errorf("failed to setup OpenID Connect provider: %w", err)
	}

	oauthCfg := oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  cfg.LoginCallbackURL,
		Scopes:       cfg.Scopes,
	}
	codeClient, err := codeflow.NewClient(
		cfg.Audience,
		oauthCfg,
		provider.Verifier(&oidc.Config{ClientID: cfg.ClientID}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to setup codeflow client: %w", err)
	}

	return &Handler{
		codeFlowClient: codeClient,
		cfg:            cfg,
		db:             db,
		sessionStorage: sessionStorage,
	}, nil
}

type Handler struct {
	cfg *Config

	codeFlowClient *codeflow.Client
	db             *database.DB
	sessionStorage *session.Storage
}

func (s *Handler) LoginHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		redirectURL := codeflow.RedirectURL(r.URL.Query().Get("to"))

		authURL := s.codeFlowClient.AuthCodeURL(redirectURL)
		http.Redirect(w, r, authURL, http.StatusFound)
	})
}

func (s *Handler) LoginCallbackHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := logging.FromContext(r.Context())

		if r.URL.Query().Get("error") != "" {
			httputils.BadRequest(w, r, r.URL.Query().Get("error_description"))
			return
		}

		accessToken, idToken, redirectURL, err := s.codeFlowClient.ExchangeCode(r)
		if err != nil {
			httputils.BadRequest(w, r, "invalid data")
			logger.Warnw("code exchange failed", "err", err)
			return
		}

		if err := s.startNewSession(w, r, accessToken, idToken); err != nil {
			httputils.InternalServerError(w, r)
			logger.Warnw("failed to start new session", "err", err)
			return
		}
		if redirectURL != "" && strings.HasPrefix(string(redirectURL), "/") {
			http.Redirect(w, r, string(redirectURL), http.StatusFound)
			return
		}
		http.Redirect(w, r, "/", http.StatusFound)
	})
}

func (s *Handler) startNewSession(w http.ResponseWriter, r *http.Request, token *oauth2.Token, idToken *oidc.IDToken) error {
	idTokenClaims := new(IDToken)
	if err := idToken.Claims(idTokenClaims); err != nil {
		return err
	}

	scopes, ok := token.Extra("scope").(string)
	if !ok {
		return fmt.Errorf("failed to extract scope from token")
	}

	queries, cleanup, err := s.db.Queries(r.Context())
	if err != nil {
		return err
	}
	defer cleanup()

	userID, err := queries.CreateUpdateUser(r.Context(), sqlc.CreateUpdateUserParams{
		Subject:   idToken.Subject,
		FirstName: idTokenClaims.GivenName,
		LastName:  idTokenClaims.FamilyName,
		Nick: sql.NullString{
			String: idTokenClaims.Nickname,
			Valid:  true,
		},
		Email: idTokenClaims.Email,
		Avatar: sql.NullString{
			String: idTokenClaims.Picture,
			Valid:  true,
		},
	})
	if err != nil {
		return err
	}

	if err := s.sessionStorage.Start(r.Context(), w, principal.Principal{
		ID:        userID,
		Subject:   principal.Subject(idToken.Subject),
		Scopes:    strings.Split(scopes, " "),
		ExpiresAt: idToken.Expiry,
		Token:     token,
	}); err != nil {
		return err
	}

	return nil
}

func (s *Handler) LogoutHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := logging.FromContext(r.Context())

		logoutURL, err := s.logoutURL()
		if err != nil {
			httputils.InternalServerError(w, r)
			logger.Warnw("failed to create logout URL", "err", err)
			return
		}

		if err = s.sessionStorage.Invalidate(r.Context(), w, r); err != nil {
			httputils.InternalServerError(w, r)
			logger.Warnw("failed to invalidate session", "err", err)
		}
		http.Redirect(w, r, logoutURL, http.StatusFound)
	})
}

func (s *Handler) logoutURL() (string, error) {
	parsed, err := url.Parse(path.Join(s.cfg.Issuer, "/v2/logout"))
	if err != nil {
		return "", fmt.Errorf("failed to parse logout URL: %w", err)
	}

	q := parsed.Query()
	q.Add("client_id", s.cfg.ClientID)
	q.Add("returnTo", s.cfg.LogoutCallbackURL)
	parsed.RawQuery = q.Encode()

	return parsed.String(), nil
}
