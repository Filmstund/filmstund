import React, { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface LoginGateProps {
  fallback: ReactNode;
}

export const LoginGate: React.FC<LoginGateProps> = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
