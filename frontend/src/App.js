import React, { Component } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { Provider, connect } from "react-redux";
import { me } from "./store/reducers";
import styled from "styled-components";

import store from "./store/reducer";

import TopBar from "./TopBar";
import Footer from "./footer/Footer";
import Home from "./routes/Home";
import Login from "./routes/Login";
import User from "./routes/User";
import Movies from "./routes/Movies";
import NewShowing from "./routes/NewShowing";

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

class App extends Component {
  componentWillMount() {
    this.props.dispatch(me.actions.requestSingle())
  }
  render() {
    const { status } = this.props;
    const signedIn = !status.error;

    return (
      <Router>
        <Container>
          <TopBar/>
          <ScrollContainer>
            <PaddingContainer>
              <Route exact path="/" render={() => (signedIn ? <Home/> : <Redirect to="/login" /> )} />
              <Route path="/login" component={Login} />
              <Route path="/user" component={User} />
              <Route path="/movies" component={Movies} />
              <Route path="/showings/new/:movieId?" component={NewShowing} />
            </PaddingContainer>
            <Footer/>
          </ScrollContainer>
        </Container>
      </Router>
    );
  }
}

const ConnectedApp = connect(state => ({
  me: state.me.data,
  status: state.me
}))(App);

const ProviderApp = () => (
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
)

export default ProviderApp
