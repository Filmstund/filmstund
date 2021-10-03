package graph

//go:generate go run github.com/99designs/gqlgen --config ../../configs/gqlgen.yml

import (

	// needed to keep the dependencies needed for the above go generate command.
	_ "github.com/99designs/gqlgen/cmd"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/site"
)

// This file will not be regenerated automatically.
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	db      *database.DB
	siteCfg site.Config
}

type SiteConfigProvider interface {
	SiteConfig() site.Config
}

func NewResolver(db *database.DB, siteCfg SiteConfigProvider) *Resolver {
	return &Resolver{
		db:      db,
		siteCfg: siteCfg.SiteConfig(),
	}
}
