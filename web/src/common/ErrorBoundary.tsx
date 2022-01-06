import React, { ReactNode } from "react";
import { ErrorScreen } from "../use-cases/common/utils/ProjectorLoader";

interface Props {
  fallback?: (error: Error) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {}

  render() {
    const { fallback = defaultFallback, children } = this.props;
    const { error } = this.state;
    if (error) {
      return fallback(error);
    } else {
      return children;
    }
  }
}

const defaultFallback = (error: Error) => {
  return <ErrorScreen error={error} />;
};
