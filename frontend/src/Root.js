import React, { Component, lazy, Suspense } from "react";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import { rollbar } from "./lib/error-reporting";
import Loader from "./use-cases/common/utils/ProjectorLoader";
import { GlobalStyles } from "./GlobalStyles";

const AsyncApp = lazy(() => import("./App"));

class Root extends Component {
  state = {
    error: null,
    hasError: false
  };

  static getDerivedStateFromError(error, info) {
    return {
      error,
      hasError: true
    };
  }

  componentDidCatch(error, info) {
    console.log(error, info.componentStack);

    rollbar.error("Root didCatch", error, info.componentStack);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        <div>
          <div>Something went wrong:</div>
          <pre>{error.stack}</pre>
        </div>
      );
    }

    return (
      <ApolloProvider client={client}>
        <Router>
          <Suspense fallback={<Loader />}>
            <Login>{props => <AsyncApp {...props} />}</Login>
          </Suspense>
        </Router>
        <GlobalStyles />
      </ApolloProvider>
    );
  }
}

export default Root;
