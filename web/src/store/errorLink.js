import { onError } from "apollo-link-error";

export const errorLink = onError(args => {
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
      // User is not signed in ???
      console.log("This should never happen...");
    } else {
      args.networkError.response = null;
      console.error(networkError);
    }
  }
});
