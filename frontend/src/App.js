import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";
import Helmet from "react-helmet";

import asyncComponent from "./AsyncComponent";
import TopBar from "./TopBar";
import Footer from "./footer/Footer";
import WelcomeModal from "./WelcomeModal";

const PaddingContainer = styled.div`
  padding: 1em;
`;

const ScrollContainer = styled.div`
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const AsyncHome = asyncComponent(() => import("./routes/Home"));
const AsyncUser = asyncComponent(() => import("./routes/User"));
const AsyncShowings = asyncComponent(() => import("./routes/Showings"));
const AsyncNewShowing = asyncComponent(() => import("./routes/NewShowing"));
const AsyncEditShowing = asyncComponent(() => import("./routes/EditShowing"));
const AsyncShowingTickets = asyncComponent(() =>
  import("./routes/ShowingTickets")
);
const AsyncSingleShowing = asyncComponent(() =>
  import("./routes/SingleShowing")
);

class App extends Component {
  render() {
    const { me, signedIn } = this.props;

    return (
      <React.Fragment>
        <Helmet titleTemplate="%s | itbio" />
        <WelcomeModal me={me} />
        <TopBar signedIn={signedIn} />
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
                path="/showings/:showingId/tickets"
                component={AsyncShowingTickets}
              />
              <Route
                path="/showings/:showingId/edit"
                component={AsyncEditShowing}
              />
              <Route
                path="/showings/:showingId"
                component={AsyncSingleShowing}
              />
            </Switch>
          </PaddingContainer>
        </ScrollContainer>
        <Footer />
      </React.Fragment>
    );
  }
}

export default App;
