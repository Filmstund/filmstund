import React, { Component, ErrorInfo, lazy, Suspense } from "react";
import "./index.css";

import { BrowserRouter as Router } from "react-router-dom";
import { Loader } from "./use-cases/common/utils/ProjectorLoader";
import { Provider as UrqlProvider } from "urql";
import { urql } from "./store/urql";

const AsyncApp = lazy(() => import("./App"));

interface State {
  error: Error | null;
  hasError: boolean;
}

export class Root extends Component<{}, State> {
  state: State = {
    error: null,
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log(error, info.componentStack);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        <div>
          <div>Something went wrong:</div>
          <pre>{error!.stack}</pre>
        </div>
      );
    }

    return (
      <UrqlProvider value={urql}>
        <Router>
          <Suspense fallback={<Loader />}>
            <AsyncApp />
          </Suspense>
        </Router>
      </UrqlProvider>
    );
  }
}
