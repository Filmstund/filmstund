import React from "react";
import { render } from "react-dom";
import { injectGlobal } from "styled-components";
import 'react-dates/initialize';

import Root from "./Root";

// eslint-disable-next-line
injectGlobal`
  html {
    background: black;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background: white;
    color: #212121;
  }
  html, body, #root {
     height: 100%;
  }
  *, *:before, *:after {
    box-sizing: border-box;
  }
`;

render(<Root />, document.getElementById("root"));
