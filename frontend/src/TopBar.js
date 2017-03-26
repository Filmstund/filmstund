import React from "react";
import styled from "styled-components";

const TopBarContainer = styled.div`
  background: maroon;
  padding: 1em 0;
`;

const Link = styled.a`
  padding: 1em;
  cursor: pointer;
  &:hover {
    color: lightgray;
    background: darkred;
  }
`;

const TopBar = React.createClass({
  render() {
    return (
      <TopBarContainer>
        <Link>Hem</Link>
        <Link>Visningar</Link>
        <Link>Användare</Link>
      </TopBarContainer>
    );
  }
});

export default TopBar;
