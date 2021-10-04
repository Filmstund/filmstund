package graph

//go:generate go run github.com/99designs/gqlgen --config ../../configs/gqlgen.yml

import (

	// needed to keep the dependencies needed for the above go generate command.
	_ "github.com/99designs/gqlgen/cmd"
	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/security"
	"github.com/filmstund/filmstund/internal/serverenv"
	"github.com/filmstund/filmstund/internal/site"
	"github.com/filmstund/filmstund/internal/user"
)

// This file will not be regenerated automatically.
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	auth0Service *security.Service
	userService  *user.Service
	db           *database.DB
	siteCfg      site.Config
}

func NewResolver(env *serverenv.ServerEnv, siteCfg site.ConfigProvider) *Resolver {
	return &Resolver{
		auth0Service: env.Auth0Service(),
		userService:  env.UserService(),
		db:           env.Database(),
		siteCfg:      siteCfg.SiteConfig(),
	}
}
