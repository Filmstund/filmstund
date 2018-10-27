import React, { Component, lazy, Suspense } from "react";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import { rollbar } from "./lib/error-reporting";
import { createGlobalStyle } from "styled-components";
import Loader from "./use-cases/common/utils/ProjectorLoader";

const AsyncApp = lazy(() => import("./App"));

const GlobalStyles = createGlobalStyle`
  html {
    background: black;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background: white;
    color: #212121;
  }
  html, body, #root {
     height: 100%;
  }
  *, *:before, *:after {
    box-sizing: border-box;
  }
`;

class Root extends Component {
  state = {
    hasError: false
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true
    };
  }

  componentDidCatch(error, info) {
    rollbar.error("Root didCatch", error, info.componentStack);
  }

  render() {
    const { hasError } = this.state;

    if (hasError) {
      return "Something went wrong!";
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
