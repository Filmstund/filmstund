import React from "react";
import { createRoot } from "react-dom";
import { Root } from "./Root";

createRoot(document.getElementById("root")!).render(<Root />);

declare global {
  interface ArrayConstructor {
    isArray(arg: ReadonlyArray<any> | any): arg is ReadonlyArray<any>;
  }
}
