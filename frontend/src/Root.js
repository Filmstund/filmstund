import React, { Component } from "react";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./routes/Login";
import App from "./App";
import { getJson } from "./lib/fetch";

class Root extends Component {
  state = { me: null };
  componentDidMount() {
    getJson("/users/me")
      .then(me => {
        this.setState({ me });
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    const { me } = this.state;
    return (
      <Login signedIn={Boolean(me)}>
        <App me={me} signedIn={Boolean(me)} />
      </Login>
    );
  }
}

const ProviderRoot = () => (
  <ApolloProvider client={client}>
    <Router>
      <Root />
    </Router>
  </ApolloProvider>
);

export default ProviderRoot;
