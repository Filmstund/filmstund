# Filmstund [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FcthdidIT%2Fitbio%2Fbadge&style=popout)](https://actions-badge.atrox.dev/cthdidIT/filmstund/goto)
A web application for making it easier planning to go to the cinema with your friends

## How to start development
First you must choose your path: the _[backend](backend)_ or the _[frontend](frontend)_

## Build
You can use the provided make script to build the frontend and backend docker images

```
make docker
```

After the build you will have the following docker images: `cthdidit/sefilm-frontend:latest` and `cthdidit/sefilm-backend:latest`.
Images are also tagged with the latest commit hash from `HEAD` during build, i.e. `cthdidit/sefilm-backend:7647247e`

## Docker

You can find Docker images for the backend [here](https://hub.docker.com/r/cthdidit/sefilm-backend/) and the frontend [here](https://hub.docker.com/r/cthdidit/sefilm-frontend/)
