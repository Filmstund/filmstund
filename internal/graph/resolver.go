package graph

//go:generate go run github.com/99designs/gqlgen --config ../../configs/gqlgen.yml

import (
	"github.com/filmstund/filmstund/filmstaden"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/site"
)

// This file will not be regenerated automatically.
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	db         *database.DB
	filmstaden *filmstaden.Client
	siteCfg    site.Config
}

func NewResolver(env *serverenv.ServerEnv, siteCfg site.ConfigProvider) *Resolver {
	return &Resolver{
		db:         env.Database(),
		filmstaden: filmstaden.NewClient(filmstaden.APIURL, env.Redis()),
		siteCfg:    siteCfg.SiteConfig(),
	}
}
