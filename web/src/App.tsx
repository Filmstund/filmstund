import styled from "@emotion/styled";
import { gql } from "@apollo/client";
import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppQuery } from "./__generated__/AppQuery";
import { completeUserFragment } from "./apollo/queries/currentUser";
import { MissingShowing } from "./use-cases/common/showing/MissingShowing";
import { Footer } from "./use-cases/common/ui/footer/Footer";

import NavBar from "./use-cases/common/ui/NavBar";
import { PageTitleTemplate } from "./use-cases/common/utils/PageTitle";
import { Loader } from "./use-cases/common/utils/ProjectorLoader";
import { suspend } from "suspend-react";
import { client } from "./store/apollo";

const MainGridContainer = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--main-bg);
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
  suspend(
    () => client.query<AppQuery>({ query: appQuery, canonizeResults: true }),
    ["user", "app"]
  );

  return (
    <>
      <PageTitleTemplate titleTemplate="%s | sefilm">
        <NavBar />
        <MainGridContainer>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route index element={<AsyncHome />} />
              <Route path="/user" element={<AsyncUser />} />
              <Route path="/showings" element={<AsyncShowings />} />
              <Route path="/showings/new" element={<AsyncNewShowing />} />
              <Route
                path="/showings/:webId/:slug"
                element={<AsyncSingleShowing />}
              />
              <Route
                path="/showings/:webId/:slug/tickets"
                element={<AsyncShowingTickets />}
              />
              <Route
                path="/showings/:webId/:slug/edit"
                element={<AsyncEditShowing />}
              />
              <Route path="/*" element={<MissingShowing />} />
            </Routes>
          </Suspense>
        </MainGridContainer>
        <Footer />
      </PageTitleTemplate>
    </>
  );
};

export default App;
