import React, { Suspense, lazy } from "react";
import { Route, Switch } from "react-router-dom";
import { graphql } from "react-apollo";
import { compose, branch, renderComponent } from "recompose";
import gql from "graphql-tag";
import styled from "styled-components";
import Helmet from "react-helmet";

import TopBar from "./use-cases/common/ui/TopBar";
import Footer from "./use-cases/common/ui/footer/Footer";
import WelcomeModal from "./use-cases/common/utils/WelcomeModal";
import { completeUserFragment } from "./apollo/queries/currentUser";
import Loader from "./use-cases/common/utils/ProjectorLoader";
import { MissingShowing } from "./use-cases/common/showing/MissingShowing";

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

const MainGridContainer = styled.div`
  flex: 1;
  grid-area: content;
  display: grid;
  grid-template-columns: minmax(1rem, 1fr) minmax(min-content, 1000px) minmax(
      1rem,
      1fr
    );
  grid-template-rows: min-content auto;
  grid-template-areas:
    "jumbo jumbo jumbo"
    ". center .";
  background-color: #f8f8f8;
  align-items: start;
`;

const AsyncHome = lazy(() => import("./use-cases/my-showings/Home"));
const AsyncUser = lazy(() => import("./use-cases/user/index"));
const AsyncShowings = lazy(() => import("./use-cases/showings-list/Showings"));
const AsyncNewShowing = lazy(() =>
  import("./use-cases/new-showing/NewShowing")
);
const AsyncEditShowing = lazy(() =>
  import("./use-cases/edit-showing/EditShowing")
);
const AsyncShowingTickets = lazy(() =>
  import("./use-cases/showing-tickets/index")
);
const AsyncSingleShowing = lazy(() =>
  import("./use-cases/single-showing/screen/SingleShowingScreen")
);

const App = ({ data: { me }, signout }) => (
  <React.Fragment>
    <Helmet titleTemplate="%s | itbio" />
    <WelcomeModal me={me} />
    <ScrollContainer>
      <TopBar signout={signout} />
      <MainGridContainer>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route exact path="/" children={<AsyncHome />} />
            <Route path="/user" children={<AsyncUser />} />
            <Route exact path="/showings" children={<AsyncShowings />} />
            <Route
              path="/showings/new/:movieId?"
              children={<AsyncNewShowing />}
            />
            <Route
              path="/showings/:webId/:slug/tickets"
              children={<AsyncShowingTickets />}
            />
            <Route
              path="/showings/:webId/:slug/edit"
              children={<AsyncEditShowing />}
            />
            <Route
              path="/showings/:webId/:slug"
              children={<AsyncSingleShowing />}
            />
            <Route children={<MissingShowing />} />
          </Switch>
        </Suspense>
      </MainGridContainer>
      <Footer />
    </ScrollContainer>
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

export default compose(
  data,
  isLoading
)(App);
