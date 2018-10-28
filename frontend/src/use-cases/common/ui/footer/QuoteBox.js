import React from "react";
import styled from "styled-components";

const QuoteBox = styled.div`
  padding: 0.5em 0;
  font-size: 14px;
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
