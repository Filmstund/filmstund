import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { LocalStorageWrapper, persistCache } from "apollo3-cache-persist";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { tokenRefresh } from "./tokenRefreshLink";
import { errorLink } from "./errorLink";

const cache = new InMemoryCache({
  possibleTypes: {},
  dataIdFromObject: (object) => {
    switch (object.__typename) {
      case "BioBudord":
        return (object as any).number;
      default:
        return object.id || object._id;
    }
  },
});

persistCache({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
});

const httpLink = new HttpLink({
  uri: BASE_GRAPHQL_URL,
});

export const client = new ApolloClient({
  link: ApolloLink.from([tokenRefresh, errorLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
