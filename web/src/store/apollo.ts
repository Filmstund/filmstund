import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { LocalStorageWrapper, persistCache } from "apollo3-cache-persist";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { errorLink } from "./errorLink";

const cache = new InMemoryCache({
  possibleTypes: {},
});

persistCache({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
});

const httpLink = new HttpLink({
  uri: BASE_GRAPHQL_URL,
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
