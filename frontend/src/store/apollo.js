import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";

const cache = new InMemoryCache({
  dataIdFromObject: object => {
    switch (object.__typename) {
      case "BioBudord":
        return object.number;
      default:
        return object.id || object._id;
    }
  }
});

persistCache({
  cache,
  storage: window.localStorage
});

const errorLink = onError(({ response, graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError && networkError.statusCode === 403) {
    const { pathname, search } = window.location;
    const returnUrl = pathname + search;

    if (pathname !== "/login" && returnUrl.indexOf("/login") !== 0) {
      window.location = `/login?return_to=${encodeURIComponent(returnUrl)}`;
    }
  }
});
const httpLink = new HttpLink({
  uri: BASE_GRAPHQL_URL,
  fetchOptions: { credentials: "include" }
});

const link = ApolloLink.from([errorLink, httpLink]);

const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  link,
  cache
});

export const wrapMutate = (mutate, variables) =>
  mutate({
    variables,
    errorPolicy: "all"
  }).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    } else {
      return result;
    }
  });

export default client;
