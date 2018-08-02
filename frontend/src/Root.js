import React, { Component } from "react";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import asyncComponent from "./use-cases/common/utils/AsyncComponent";
import { rollbar } from "./lib/error-reporting";

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
      </ApolloProvider>
    );
  }
}

export default Root;
