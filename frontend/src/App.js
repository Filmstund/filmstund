import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { Provider, connect } from "react-redux";
import { me, meta } from "./store/reducers";
import styled from "styled-components";

import store, { history } from "./store/reducer";

import asyncComponent from "./AsyncComponent";
import TopBar from "./TopBar";
import Footer from "./footer/Footer";
import Login from "./routes/Login";

const PaddingContainer = styled.div`
  padding: 1em;
  flex: 1;
`;

const ScrollContainer = styled.div`
  -webkit-overflow-scrolling: touch;
  overflow: scroll;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const AsyncHome = asyncComponent(() => import("./routes/Home"));
const AsyncUser = asyncComponent(() => import("./routes/User"));
const AsyncShowings = asyncComponent(() => import("./routes/Showings"));
const AsyncNewShowing = asyncComponent(() => import("./routes/NewShowing"));
const AsyncSingleShowing = asyncComponent(() =>
  import("./routes/SingleShowing")
);

class App extends Component {
  componentWillMount() {
    this.props.dispatch(me.actions.requestSingle());
    this.props.dispatch(meta.actions.requestSingle());
  }
  render() {
    const { status } = this.props;
    const signedIn = status.data.id !== undefined;

    return (
      <ConnectedRouter history={history}>
        <Login signedIn={signedIn}>
          <TopBar />
          <ScrollContainer>
            <PaddingContainer>
              <Switch>
                <Route exact path="/" component={AsyncHome} />
                <Route path="/user" component={AsyncUser} />
                <Route exact path="/showings" component={AsyncShowings} />
                <Route
                  path="/showings/new/:movieId?"
                  component={AsyncNewShowing}
                />
                <Route
                  path="/showings/:showingId"
                  component={AsyncSingleShowing}
                />
              </Switch>
            </PaddingContainer>
            <Footer />
          </ScrollContainer>
        </Login>
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
