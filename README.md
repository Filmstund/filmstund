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
- ~~postgres~~ (_not yet implemented_)

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
