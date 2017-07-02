import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { Provider, connect } from "react-redux";
import { me, meta } from "./store/reducers";
import styled from "styled-components";

import store, { history } from "./store/reducer";

import TopBar from "./TopBar";
import Footer from "./footer/Footer";
import Login from "./routes/Login";

const PaddingContainer = styled.div`
  padding: 1em;
  flex: 1;
`;

const ScrollContainer = styled.div`
  overflow: scroll;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  height: 100vh;
`;

const loadRoute = cb => module => cb(null, module.default);

class App extends Component {
  componentWillMount() {
    this.props.dispatch(me.actions.requestSingle());
    this.props.dispatch(meta.actions.requestSingle());
  }
  render() {
    const { status } = this.props;
    const signedIn = status.data.id !== undefined;

    if (!signedIn) {
      return (
        <Container>
          <PaddingContainer>
            <Login />
          </PaddingContainer>
          <Footer />
        </Container>
      );
    }

    return (
      <ConnectedRouter history={history}>
        <Container>
          <TopBar />
          <ScrollContainer>
            <PaddingContainer>
              <Switch>
                <Route
                  exact
                  path="/"
                  getComponent={cb =>
                    import("./routes/Home").then(loadRoute(cb))}
                />
                <Route
                  path="/login"
                  render={() => (signedIn ? <Redirect to="/" /> : <Login />)}
                />
                <Route
                  path="/user"
                  getComponent={cb =>
                    import("./routes/User").then(loadRoute(cb))}
                />
                <Route
                  exact
                  path="/showings"
                  getComponent={cb =>
                    import("./routes/Showings").then(loadRoute(cb))}
                />
                <Route
                  path="/showings/new/:movieId?"
                  getComponent={cb =>
                    import("./routes/NewShowing").then(loadRoute(cb))}
                />
                <Route
                  path="/showings/:showingId"
                  getComponent={cb =>
                    import("./routes/SingleShowing").then(loadRoute(cb))}
                />
              </Switch>
            </PaddingContainer>
            <Footer />
          </ScrollContainer>
        </Container>
      </ConnectedRouter>
    );
  }
}

const ConnectedApp = connect(state => ({
  status: state.me
}))(App);

const ProviderApp = () =>
  <Provider store={store}>
    <ConnectedApp />
  </Provider>;

export default ProviderApp;
