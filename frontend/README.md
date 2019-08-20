# ITBio frontend

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

### Requirements

- `yarn`

### Get up and running

```sh
$ yarn
$ yarn start
```

### Update GQL Typescript typings

```sh
$ yarn apollo client:codegen --target typescript --includes "src/**/*.{js,ts,tsx}" --endpoint http://localhost:8080/graphql --header 'Authorization: Bearer token_here'
```
