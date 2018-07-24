import React from "react";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./use-cases/login/containers/Login";
import App from "./App";

const Root = () => (
  <ApolloProvider client={client}>
    <Router>
      <Login>{props => <App {...props} />}</Login>
    </Router>
  </ApolloProvider>
);

export default Root;
