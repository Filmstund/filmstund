package graph

//go:generate go run github.com/99designs/gqlgen --config ../../configs/gqlgen.yml

import (

	// needed to keep the dependencies needed for the above go generate command.
	_ "github.com/99designs/gqlgen/cmd"
	"github.com/filmstund/filmstund/internal/database"
)

// This file will not be regenerated automatically.
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB *database.DB
}
