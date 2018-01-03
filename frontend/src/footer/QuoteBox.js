import React from "react";
import styled from "styled-components";

const QuoteBox = styled.div`
  padding: 0.5em 0;
  opacity: ${props => (props.faded ? 0 : 1)};
  transition: 1s opacity;

  > blockquote {
    margin: 0;
    > span {
      font-style: italic;
    }
  }
  small {
    font-style: italic;
  }
`;

const TopBar = ({ children, number, faded }) => (
  <QuoteBox faded={faded}>
    <blockquote>
      "<span>{children}</span>"
    </blockquote>
    <small>- de bio budorden {number}</small>
  </QuoteBox>
);

export default TopBar;
