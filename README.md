# Filmstund

A web application for making it easier planning to go to the cinema with your friends

[![CI](https://github.com/Filmstund/filmstund/actions/workflows/ci.yml/badge.svg)](https://github.com/Filmstund/filmstund/actions/workflows/ci.yml)
[![Deploy beta](https://github.com/Filmstund/filmstund/actions/workflows/deploy-beta.yml/badge.svg)](https://github.com/Filmstund/filmstund/actions/workflows/deploy-beta.yml)

# React frontend

```shell
cd web
yarn
yarn build
yarn test
```

## Requirements

- `yarn`
- Node 16

# Go backend

The backend is written in Go and is currently also serving up the frontend using a file server.

### Linting and sanity checks

These checks need to pass in order to be able to merge a pull request:

```shell
make checks
```

### Build

You can use the provided Makefile to build the project.

```shell
make build
```

### Running

```shell
export OIDC_CLIENT_ID=jyXDFia9V5Hjy43pweTHo3A1onBRJEHk
export OIDC_CLIENT_SECRET=<ask-a-dev>
export OIDC_AUDIENCE=https://filmstund-dev
export OIDC_ISSUER=https://dev-filmstund.eu.auth0.com/
export LOGGER_VERBOSITY=10
make run
```

## Requirements

The following sections details how to setup the requirements to run the backend server.

- `go` >1.17
- postgres
- redis

### Database

To run the app you will need to have access to a Postgres instance.

#### Docker

An easy solution is to run Postgres using docker:

```shell
docker run --name postgres -e POSTGRES_PASSWORD=filmstund -e POSTGRES_USER=filmstund -e POSTGRES_DB=filmstund -d -p 5432:5432 postgres:13
```

#### Podman

Alternatively, you can use `podman` instead of docker:

```shell
sudo podman run -d --rm -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=filmstund -e POSTGRES_USER=filmstund -e POSTGRES_DB=filmstund postgres:13
```

#### Migrations

Our database migrations are written in [migrate-go](https://github.com/golang-migrate/migrate) format.
To run the migrations, do the following:

```shell
go run ./cmd/migrate --path configs/database/migrations
```

_Note that the username, password etc are configured using environment, and the same rules as the normal backend applies._

##### Add new migration

To add a new migration, do the following:

```shell
# Skip the first step if you already have migrate installed and in your $PATH
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
migrate create -ext sql -seq -dir configs/database/migrations <migration_name_goes_here>
```

### Redis

[Redis](https://redis.io/) is used as a cache for ephemeral data that expire after some duration.

You can configure Redis using environment variables:

```shell
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379
```

_note that the above values are the defaults_

If your redis instance is setup to use a "master" password, you can configure that using the `REDIS_PASSWORD` env var.

#### Installation (macOS)

On macOS, you can use Brew:

```shell
brew install redis
brew services start redis
# Optionally configure:
vim /usr/local/etc/redis.conf
```

Or docker/podman:

```shell
docker run -d --name redis -p 6379:6379 redis
podman run -d --rm --name redis -p 6379:6379 redis
```
