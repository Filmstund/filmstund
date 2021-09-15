# Filmstund frontend

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
# Remove old typings
$ find src -name __generated__ -exec rm -r {} \;

# Fetch new typings unauthorized
$ yarn apollo client:codegen --target typescript --customScalarsPrefix=SeFilm --passthroughCustomScalars --includes "src/**/*.{js,ts,tsx}" --globalTypesFile=src/__generated__/globalTypes.ts --endpoint http://localhost:8080/graphql

# Fetch new typings with bearer token
$ yarn apollo client:codegen --target typescript --customScalarsPrefix=SeFilm --passthroughCustomScalars --includes "src/**/*.{js,ts,tsx}" --globalTypesFile=src/__generated__/globalTypes.ts --endpoint http://localhost:8080/graphql --header 'Authorization: Bearer token_here'
```
