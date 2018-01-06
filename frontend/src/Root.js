import React, { Component } from "react";
import { ApolloProvider, graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { completeUserFragment } from "./fragments/currentUser";

import { BrowserRouter as Router } from "react-router-dom";

import client from "./store/apollo";
import Login from "./routes/Login";
import App from "./App";

class RootComponent extends Component {
  render() {
    const { data: { me, loading } } = this.props;
    const signedIn = Boolean(me);

    return (
      <Login signedIn={signedIn && !loading}>
        <App me={me} signedIn={signedIn} />
      </Login>
    );
  }
}

const data = graphql(gql`
  query RootComponentQuery {
    me: currentUser {
      ...CompleteUser
    }
  }
  ${completeUserFragment}
`);

const RootWithData = compose(data)(RootComponent);

const ProviderRoot = () => (
  <ApolloProvider client={client}>
    <Router>
      <RootWithData />
    </Router>
  </ApolloProvider>
);

export default ProviderRoot;
