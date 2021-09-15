import React, { StrictMode } from "react";
import { render } from "react-dom";
import { Root } from "./Root";

render(
  <StrictMode>
    <Root />
  </StrictMode>,
  document.getElementById("root")
);

declare global {
  interface ArrayConstructor {
    isArray(arg: ReadonlyArray<any> | any): arg is ReadonlyArray<any>;
  }
}
