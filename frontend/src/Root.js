import React, { Component } from "react";
import { ConnectedRouter } from "react-router-redux";
import { Provider, connect } from "react-redux";
import { me, meta } from "./store/reducers";

import store, { history } from "./store/reducer";
import Login from "./routes/Login";
import App from "./App";


class Root extends Component {
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
          <App me={status.data} />
        </Login>
      </ConnectedRouter>
    );
  }
}

const ConnectedRoot = connect(state => ({
  status: state.me
}))(Root);

const ProviderRoot = () =>
  <Provider store={store}>
    <ConnectedRoot />
  </Provider>;

export default ProviderRoot;
