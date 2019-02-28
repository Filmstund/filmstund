import React from "react";
import styled from "@emotion/styled";
import { SMALL_FONT_SIZE } from "../../../../lib/style-vars";

const QuoteBox = styled.div`
  padding: 0.5em 0;
  font-size: ${SMALL_FONT_SIZE};
  color: #9b9b9b;
  font-weight: 400;
  opacity: ${props => (props.faded ? 0 : 1)};
  transition: 1s opacity;

  > blockquote {
    margin: 0;
  }
`;

const NavBar = ({ children, number, faded }) => (
  <QuoteBox faded={faded}>
    <blockquote>
      "<span>{children}</span>"
    </blockquote>
    <small>— de bio budorden {number}</small>
  </QuoteBox>
);

export default NavBar;
