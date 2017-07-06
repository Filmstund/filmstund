import React from "react";
import ReactDOM from "react-dom";
import { injectGlobal } from "styled-components";

import App from "./App";

// eslint-disable-next-line
injectGlobal`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background: white;
    color: #212121;
  }
  *, *:before, *:after {
    box-sizing: border-box;
  }
`;

ReactDOM.render(<App />, document.getElementById("root"));
