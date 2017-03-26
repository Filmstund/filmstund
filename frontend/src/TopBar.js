import React from "react";
import styled from "styled-components";

const TopBarContainer = styled.div`
  background: maroon;
  padding: 1em;
`;

const Link = styled.a`
  padding: 0 1em 0 1em;
  cursor: pointer;
  &:hover {
    color: lightgray;
  }
`

const TopBar = React.createClass({
  render() {
    return (
      <TopBarContainer>
        <Link>This is link</Link>
        <Link>This is link2</Link>
        <Link>This is link3</Link>
      </TopBarContainer>
    );
  }
});



export default TopBar;