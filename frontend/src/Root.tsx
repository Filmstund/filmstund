import React, { Component, lazy, Suspense, ErrorInfo } from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import { rollbar } from "./lib/error-reporting";
import Loader from "./use-cases/common/utils/ProjectorLoader";
import { GlobalStyles } from "./GlobalStyles";

const AsyncApp = lazy(() => import("./App"));

interface State {
  error: Error | null;
  hasError: boolean;
}

export class Root extends Component<{}, State> {
  state: State = {
    error: null,
    hasError: false
  };

  static getDerivedStateFromError(error: Error) {
    return {
      error,
      hasError: true
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log(error, info.componentStack);

    rollbar.error("Root didCatch", error, info.componentStack);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        <div>
          <div>Something went wrong:</div>
          <pre>{error!.stack}</pre>
        </div>
      );
    }

    return (
      <ApolloProvider client={client}>
        <ApolloHooksProvider client={client}>
          <Router>
            <Suspense fallback={<Loader />}>
              <Login>{(props: any) => <AsyncApp {...props} />}</Login>
            </Suspense>
          </Router>
          <GlobalStyles />
        </ApolloHooksProvider>
      </ApolloProvider>
    );
  }
}
