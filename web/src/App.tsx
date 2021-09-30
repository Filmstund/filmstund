import styled from "@emotion/styled";
import { gql } from "@apollo/client";
import React, { lazy, Suspense } from "react";
import { useQuery } from "@apollo/client";
import { Route, Switch } from "react-router";
import { AppQuery } from "./__generated__/AppQuery";
import { completeUserFragment } from "./apollo/queries/currentUser";
import { MissingShowing } from "./use-cases/common/showing/MissingShowing";
import { Footer } from "./use-cases/common/ui/footer/Footer";

import NavBar from "./use-cases/common/ui/NavBar";
import { PageTitleTemplate } from "./use-cases/common/utils/PageTitle";
import Loader from "./use-cases/common/utils/ProjectorLoader";
import { WelcomeModal } from "./use-cases/common/utils/WelcomeModal";

const MainGridContainer = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #f8f8f8;
  justify-content: stretch;
  padding: 1rem;
`;

const AsyncHome = lazy(() => import("./use-cases/my-showings/Home"));
const AsyncUser = lazy(() => import("./use-cases/user"));
const AsyncShowings = lazy(() => import("./use-cases/showings-list/Showings"));
const AsyncNewShowing = lazy(
  () => import("./use-cases/new-showing/NewShowing")
);
const AsyncEditShowing = lazy(
  () => import("./use-cases/edit-showing/EditShowing")
);
const AsyncShowingTickets = lazy(
  () => import("./use-cases/showing-tickets/TicketScreen")
);
const AsyncSingleShowing = lazy(
  () => import("./use-cases/single-showing/screen/SingleShowingScreen")
);

const appQuery = gql`
  query AppQuery {
    me: currentUser {
      ...CompleteUser
    }
  }
  ${completeUserFragment}
`;

interface Props {}

const App: React.FC<Props> = () => {
  const { data } = useQuery<AppQuery>(appQuery);

  if (!data || !data.me) {
    return <Loader />;
  }

  const me = data.me;

  return (
    <>
      <PageTitleTemplate titleTemplate="%s | sefilm">
        <NavBar />
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
