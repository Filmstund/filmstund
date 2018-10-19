import React, { Component } from "react";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import asyncComponent from "./use-cases/common/utils/AsyncComponent";
import { rollbar } from "./lib/error-reporting";
import { createGlobalStyle } from "styled-components";

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

const AsyncApp = asyncComponent(() => import("./App"));

class Root extends Component {
  state = {
    hasError: false
  };

  componentDidCatch(error, info) {
    rollbar.error("Root didCatch", error, info);
    this.setState({
      hasError: true
    });
  }

  render() {
    const { hasError } = this.state;

    if (hasError) {
      return "Something went wrong!";
    }

    return (
      <ApolloProvider client={client}>
        <Router>
          <Login>{props => <AsyncApp {...props} />}</Login>
        </Router>
        <GlobalStyles />
      </ApolloProvider>
    );
  }
}

export default Root;
