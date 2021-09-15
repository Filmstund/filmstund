import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import fetch from "../lib/fetch";
import { tokenRefresh } from "./tokenRefreshLink";
import { errorLink } from "./errorLink";

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

const httpLink = new HttpLink({
  uri: BASE_GRAPHQL_URL,
  fetch
});

const link = ApolloLink.from([tokenRefresh, errorLink, httpLink]);

const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  defaultOptions: {
    query: {
      fetchPolicy: "cache-and-network"
    }
  },
  link,
  cache
});

export default client;
