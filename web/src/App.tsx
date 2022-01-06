import styled from "@emotion/styled";
import React, { lazy, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { MissingShowing } from "./use-cases/common/showing/MissingShowing";
import { Footer } from "./use-cases/common/ui/footer/Footer";

import { NavBar } from "./use-cases/common/ui/NavBar";
import { PageTitleTemplate } from "./use-cases/common/utils/PageTitle";
import { ErrorScreen, Loader } from "./use-cases/common/utils/ProjectorLoader";
import { ErrorBoundary } from "./common/ErrorBoundary";
import { Toaster } from "./common/toast/Toaster";

const MainGridContainer = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--main-bg);
  justify-content: stretch;
  padding: 1rem;
`;

const AsyncHome = lazy(() => import("./use-cases/my-showings/Home"));
const AsyncUser = lazy(() => import("./use-cases/user/UserScreen"));
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

interface Props {}

const App: React.FC<Props> = () => {
  const [errorKey, setErrorKey] = useState(0);
  return (
    <PageTitleTemplate titleTemplate="%s | sefilm">
      <NavBar onNavigate={() => setErrorKey((k) => k + 1)} />
      <ErrorBoundary
        key={errorKey}
        fallback={(error) => <ErrorScreen error={error} />}
      >
        <MainGridContainer>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route index element={<AsyncHome />} />
              <Route path="/user" element={<AsyncUser />} />
              <Route path="/showings" element={<AsyncShowings />} />
              <Route path="/showings/new" element={<AsyncNewShowing />} />
              <Route
                path="/showings/:webID/:slug"
                element={<AsyncSingleShowing />}
              />
              <Route
                path="/showings/:webID/:slug/tickets"
                element={<AsyncShowingTickets />}
              />
              <Route
                path="/showings/:webID/:slug/edit"
                element={<AsyncEditShowing />}
              />
              <Route path="/*" element={<MissingShowing />} />
            </Routes>
          </Suspense>
        </MainGridContainer>
      </ErrorBoundary>
      <Toaster />
      <Footer />
    </PageTitleTemplate>
  );
};

export default App;
