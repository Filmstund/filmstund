import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { tokenRefresh } from "./tokenRefreshLink";
import { errorLink } from "./errorLink";

const cache = new InMemoryCache({
  fragmentMatcher: [],
  dataIdFromObject: (object) => {
    switch (object.__typename) {
      case "BioBudord":
        return object.number;
      default:
        return object.id || object._id;
    }
  },
});

await persistCache({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
});

const httpLink = new HttpLink({
  uri: BASE_GRAPHQL_URL,
});

const link = ApolloLink.from([tokenRefresh, errorLink, httpLink]);

const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  defaultOptions: {
    query: {
      fetchPolicy: "cache-and-network",
    },
  },
  link,
  cache,
});

export default client;
