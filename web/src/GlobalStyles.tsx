import React from "react";
import { Global, css } from "@emotion/react";

const globalStyles = css`
  @font-face {
    font-family: "SF-Sans";
    src: url(/fonts/d7551cd237e381b3be5e87a918b631fb.woff2) format("woff2"),
      url(/fonts/414bcbe1ce52da906ed792fd69b6783b.woff) format("woff");
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: "SF-Sans";
    src: url(/fonts/54a968ad357ac706e5e69275cff9e751.woff2) format("woff2"),
      url(/fonts/148cd61b007bba66aa778d20bae538b3.woff) format("woff");
    font-weight: bold;
    font-style: normal;
  }

  html {
    background: black;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: "Roboto", sans-serif;
    background: white;
    color: #212121;
  }
  html,
  body,
  #root {
    height: 100%;
  }
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }
`;

export const GlobalStyles = () => <Global styles={globalStyles} />;
