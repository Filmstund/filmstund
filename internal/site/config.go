package site

type Config struct {
	Host              string `env:"SITE_HOST,default=staging.filmstund.se"`
	Scheme            string `env:"SITE_SCHEME,default=https"`
	CalendarURLPrefix string `env:"SITE_CALENDAR_PREFIX,default=/calendar/ical"`

	AllowedOrigins []string `env:"SITE_ALLOWED_ORIGINS,default=http://localhost:3000,http://localhost:8080"`
}

type ConfigProvider interface {
	SiteConfig() Config
}
