import React, { Suspense, lazy } from "react";
import { Route, Switch } from "react-router";
import gql from "graphql-tag";
import styled from "@emotion/styled";

import NavBar from "./use-cases/common/ui/NavBar";
import Footer from "./use-cases/common/ui/footer/Footer";
import { WelcomeModal } from "./use-cases/common/utils/WelcomeModal";
import { completeUserFragment } from "./apollo/queries/currentUser";
import Loader from "./use-cases/common/utils/ProjectorLoader";
import { MissingShowing } from "./use-cases/common/showing/MissingShowing";
import { PageTitleTemplate } from "./use-cases/common/utils/PageTitle";
import { useQuery } from "react-apollo-hooks";
import { AppQuery } from "./__generated__/AppQuery";

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

const appQuery = gql`
  query AppQuery {
    me: currentUser {
      ...CompleteUser
    }
  }
  ${completeUserFragment}
`;

interface Props {
  signout: () => void;
}

const App: React.FC<Props> = ({ signout }) => {
  const { data } = useQuery<AppQuery>(appQuery, { suspend: true });
  const me = data!.me;

  return (
    <>
      <PageTitleTemplate titleTemplate="%s | sefilm">
        <WelcomeModal me={me} />
        <NavBar signout={signout} />
        <MainGridContainer>
          <Suspense fallback={<Loader />}>
            <Switch>
              <Route exact path="/" component={AsyncHome} />
              <Route path="/user" component={AsyncUser} />
              <Route exact path="/showings" component={AsyncShowings} />
              <Route
                path="/showings/new/:movieId?"
                component={AsyncNewShowing}
              />
              <Route
                path="/showings/:webId/:slug/tickets"
                component={AsyncShowingTickets}
              />
              <Route
                path="/showings/:webId/:slug/edit"
                component={AsyncEditShowing}
              />
              <Route
                path="/showings/:webId/:slug"
                component={AsyncSingleShowing}
              />
              <Route component={MissingShowing} />
            </Switch>
          </Suspense>
        </MainGridContainer>
        <Footer />
      </PageTitleTemplate>
    </>
  );
};

export default App;
