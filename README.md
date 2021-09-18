# Filmstund

A web application for making it easier planning to go to the cinema with your friends

[![Sanity checks](https://github.com/Filmstund/filmstund/actions/workflows/checks.yml/badge.svg)](https://github.com/Filmstund/filmstund/actions/workflows/checks.yml)
[![Frontend](https://github.com/Filmstund/filmstund/actions/workflows/frontend.yml/badge.svg)](https://github.com/Filmstund/filmstund/actions/workflows/frontend.yml)
[![Backend](https://github.com/Filmstund/filmstund/actions/workflows/backend.yml/badge.svg)](https://github.com/Filmstund/filmstund/actions/workflows/backend.yml)

## React frontend

```shell
cd web
yarn
yarn build
yarn test
```

## Go backend

### Requirements

- `go` >1.17
- postgres

### Linting and sanity checks

```shell
make checks
```

### Build

You can use the provided Makefile

```shell
make build
```

### Running

```shell
make run
```

### Database

Start Postgres using Docker:

```shell
docker run --name postgres -e POSTGRES_PASSWORD=filmstund -e POSTGRES_USER=filmstund -e POSTGRES_DB=filmstund -d -p 5432:5432 postgres:13
```

Our database migrations are written in [migrate-go](https://github.com/golang-migrate/migrate) format.
To run the migrations, do the following:

```shell
go run ./cmd/migrate --path configs/database/migrations
```

_Note that the username, password etc are configured using environment, and the same rules as the normal backend applies._

#### Add new migration

To add a new migration, do the following:

```shell
# Skip the first step if you already have migrate installed and in your $PATH
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
migrate create -ext sql -dir configs/database/migrations migration_name_goes_here
```
