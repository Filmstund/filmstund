import * as React from "react";
import { useContext } from "react";

export const SessionContext = React.createContext<() => void>(() => {
});

export const useSignOut = () => useContext(SessionContext);
