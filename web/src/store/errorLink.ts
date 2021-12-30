import { onError } from "@apollo/client/link/error";

export const errorLink = onError((args) => {
  const { graphQLErrors, networkError } = args;
  if (graphQLErrors)
    graphQLErrors.map((error) =>
      console.log(`[GraphQL error] ${error.message}`, error)
    );

  if (networkError) {
    if ((networkError as any).noTokenError) {
      (networkError as any).response = null;
      // user signing out => ignore error.
      return;
    } else if (
      (networkError as any).statusCode === 403 ||
      (networkError as any).statusCode === 401
    ) {
      if (window.location.pathname !== "/login") {
        window.location.pathname = "/login";
      }
      // User is not signed in ???
      console.log("This should never happen...");
    } else {
      (networkError as any).response = null;
      console.error(networkError);
    }
  }
});
