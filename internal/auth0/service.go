package auth0

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"edholm.dev/go-logging"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/filmstund/filmstund/internal/auth0/codeflow"
	"github.com/filmstund/filmstund/internal/auth0/principal"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/sqlc"
	"github.com/filmstund/filmstund/internal/httputils"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/session"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

func NewService(ctx context.Context, cfg *Config, db *database.DB, sessionStorage *session.Storage) (*Service, error) {
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
		verifier:       provider.Verifier(&oidc.Config{ClientID: cfg.ClientID}),
		cfg:            cfg,
		pkceCache:      codeflow.NewPkceCache(),
		db:             db,
		sessionStorage: sessionStorage,
	}, nil
}

type Service struct {
	oauthCfg oauth2.Config
	verifier *oidc.IDTokenVerifier

	cfg *Config

	pkceCache      *codeflow.PkceCache
	db             *database.DB
	sessionStorage *session.Storage
}

func setCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	kaka := http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int((5 * time.Minute).Seconds()),
		Secure:   r.TLS != nil, // TODO: this won't work if proxy-forwared to non-tls I assume?
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // TODO: how to use strict?
	}
	http.SetCookie(w, &kaka)
}

//goland:noinspection GoUnusedFunction
//nolint:deadcode,unused
func clearCookie(w http.ResponseWriter, name, path, domain string) {
	http.SetCookie(w, &http.Cookie{
		Name:   name,
		Path:   path,
		Domain: domain,
		MaxAge: -1,
	})
}

func (s *Service) LoginHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		state := codeflow.State(security.RandBase64String(43))
		nonce := security.RandBase64String(43)
		// TODO: switch to pkce cache instead.
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

func (s *Service) LoginCallbackHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger := logging.FromContext(r.Context())

		if r.URL.Query().Get("error") != "" {
			httputils.BadRequest(w, r, r.URL.Query().Get("error_description"))
			return
		}

		state, err := validateState(r, w)
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

		err = validateNonce(r, w, idToken, logger)
		if err != nil {
			httputils.RespondBasedOnErr(err, w, r)
			return
		}

		if err := s.startNewSession(w, r, idToken, scopes); err != nil {
			httputils.InternalServerError(w, r)
			logger.Warnw("failed to start new session", "err", err)
			return
		}

		http.Redirect(w, r, "/", http.StatusFound)
	})
}

func (s *Service) startNewSession(w http.ResponseWriter, r *http.Request, idToken *oidc.IDToken, scopes string) error {
	if err := s.sessionStorage.Start(r.Context(), w, principal.Principal{
		Subject:   principal.Subject(idToken.Subject),
		Scopes:    strings.Split(scopes, " "),
		ExpiresAt: idToken.Expiry,
		Token:     nil, // TODO
	}); err != nil {
		return err
	}

	idTokenClaims := new(IDToken)
	if err := idToken.Claims(idTokenClaims); err != nil {
		return err
	}

	queries, cleanup, err := s.db.Queries(r.Context())
	if err != nil {
		return err
	}
	defer cleanup()

	_, err = queries.CreateUpdateUser(r.Context(), sqlc.CreateUpdateUserParams{
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

	// TODO: use userID
	return err
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

func validateState(r *http.Request, w http.ResponseWriter) (codeflow.State, error) {
	stateCookie, err := r.Cookie("state")
	if err != nil {
		return "", fmt.Errorf("state not found")
	}

	if r.URL.Query().Get("state") != stateCookie.Value {
		return "", fmt.Errorf("state doesn't match")
	}

	clearCookie(w, stateCookie.Name, stateCookie.Path, stateCookie.Domain)
	return codeflow.State(stateCookie.Value), nil
}

func validateNonce(r *http.Request, w http.ResponseWriter, idToken *oidc.IDToken, logger *zap.SugaredLogger) error {
	nonceCookie, err := r.Cookie("nonce")
	if err != nil {
		return fmt.Errorf("%w: nonce not found", httputils.ErrBadRequest)
	}
	if idToken.Nonce != nonceCookie.Value {
		logger.Infow("nonce from cookie didn't match ID token nonce")
		return fmt.Errorf("%w: wrong nonce", httputils.ErrBadRequest)
	}

	clearCookie(w, nonceCookie.Name, nonceCookie.Path, nonceCookie.Domain)
	return nil
}

func (s *Service) LogoutHandler() http.Handler {
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
