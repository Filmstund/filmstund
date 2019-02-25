import React, { Component, lazy, Suspense } from "react";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import { rollbar } from "./lib/error-reporting";
import { Global, css } from "@emotion/core";
import Loader from "./use-cases/common/utils/ProjectorLoader";

const AsyncApp = lazy(() => import("./App"));

const globalStyles = css`
  html {
    background: black;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: "Roboto", sans-serif;
    background: white;
    color: #212121;
  }
  html,
  body,
  #root {
    height: 100%;
  }
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }
`;

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
        <Global styles={globalStyles} />
      </ApolloProvider>
    );
  }
}

export default Root;
