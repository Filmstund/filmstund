import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import fetch from "../lib/fetch";

const cache = new InMemoryCache({
  fragmentMatcher: [],
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

const errorLink = onError(args => {
  const { graphQLErrors, networkError } = args;
  if (graphQLErrors)
    graphQLErrors.map(error =>
      console.log(`[GraphQL error] ${error.message}`, error)
    );

  if (networkError) {
    if (networkError.noTokenError) {
      args.networkError.response = null;
      // user signing out => ignore error.
      return;
    } else if (
      networkError.statusCode === 403 ||
      networkError.statusCode === 401
    ) {
      const { pathname, search } = window.location;
      const returnUrl = pathname + search;
      console.log("Not signed in or signed out due to cookie expiry", { returnUrl });
    }
  }
});

const httpLink = new HttpLink({
  uri: BASE_GRAPHQL_URL,
  fetch
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
