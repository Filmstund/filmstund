package migrations

import "embed"

//go:embed *.sql
//nolint:gochecknoglobals
var Filesystem embed.FS
