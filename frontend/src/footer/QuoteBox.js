import React from "react";
import styled from "styled-components";

const QuoteBox = styled.div`
  padding: 0.5em 0;
  
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

const TopBar = ({ children, number }) =>
  <QuoteBox>
    <blockquote>
      "<span>{children}</span>"
    </blockquote>
    <small>- de bio budorden {number}</small>
  </QuoteBox>;

export default TopBar;
