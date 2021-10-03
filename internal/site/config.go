package site

type Config struct {
	Domain   string `env:"SITE_DOMAIN,default=staging.filmstund.se"`
	Protocol string `env:"SITE_PROTOCOL,default=https://"`
}
