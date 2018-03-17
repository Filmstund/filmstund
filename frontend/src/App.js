import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { graphql } from "react-apollo";
import { compose, branch, renderComponent } from "recompose";
import gql from "graphql-tag";
import styled from "styled-components";
import Helmet from "react-helmet";

import asyncComponent from "./AsyncComponent";
import TopBar from "./TopBar";
import Footer from "./footer/Footer";
import WelcomeModal from "./WelcomeModal";
import { completeUserFragment } from "./fragments/currentUser";
import Loader from "./ProjectorLoader";
import { UUIDToWebId } from "./UUIDToWebId";

const PaddingContainer = styled.div`
  padding: 1em;
`;

const ScrollContainer = styled.div`
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: #f8f8f8;
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

const App = ({ data: { me }, signout }) => (
  <React.Fragment>
    <Helmet titleTemplate="%s | itbio" />
    <WelcomeModal me={me} />
    <TopBar signout={signout} />
    <ScrollContainer>
      <PaddingContainer>
        <Switch>
          <Route exact path="/" component={AsyncHome} />
          <Route path="/user" component={AsyncUser} />
          <Route exact path="/showings" component={AsyncShowings} />
          <Route path="/showings/new/:movieId?" component={AsyncNewShowing} />
          <Route
            path="/showings/:webId/:slug/tickets"
            component={AsyncShowingTickets}
          />
          <Route
            path="/showings/:webId/:slug/edit"
            component={AsyncEditShowing}
          />
          <Route path="/showings/:webId/:slug" component={AsyncSingleShowing} />
          <Route
            path="/showings/:showingId/:rest?"
            render={props => (
              <UUIDToWebId {...props.match.params}>
                {({ webId, slug }) => (
                  <Redirect to={`/showings/${webId}/${slug}`} />
                )}
              </UUIDToWebId>
            )}
          />
        </Switch>
      </PaddingContainer>
    </ScrollContainer>
    <Footer />
  </React.Fragment>
);

const data = graphql(gql`
  query AppQuery {
    me: currentUser {
      ...CompleteUser
    }
  }
  ${completeUserFragment}
`);

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(data, isLoading)(App);
