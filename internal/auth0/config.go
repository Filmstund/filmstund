package auth0

type Config struct {
	ClientID     string `env:"OIDC_CLIENT_ID, required"`
	ClientSecret string `env:"OIDC_CLIENT_SECRET, required" json:"-"`

	// The issuer of our tokens (who created and signed our tokens)
	Issuer string `env:"OIDC_ISSUER, required"`
	// Audience of the API we want to use (who, or what is the tokens intended for)
	Audience string `env:"OIDC_AUDIENCE, required"`
	// The scopes to request for our tokens
	Scopes []string `env:"OIDC_SCOPES, default=openid,profile,email,offline_access"`

	// Where should auth0 return users?
	LoginCallbackURL  string `env:"OIDC_LOGIN_CALLBACK_URL, default=http://local.filmstund.se:8080/login/callback"`
	LogoutCallbackURL string `env:"OIDC_LOGOUT_CALLBACK_URL, default=http://local.filmstund.se:8080/"`
}

func (c Config) Auth0Config() Config {
	return c
}

type ConfigProvider interface {
	Auth0Config() Config
}
