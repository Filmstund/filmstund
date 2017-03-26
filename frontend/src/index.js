import React from "react";
import ReactDOM from "react-dom";
import { injectGlobal } from "styled-components";

import App from "./App";

const globalStyles = injectGlobal`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background: maroon;
  }
  *, *:before, *:after {
    box-sizing: border-box;
  }
  @font-face {

  }
`;

ReactDOM.render(<App />, document.getElementById("root"));
