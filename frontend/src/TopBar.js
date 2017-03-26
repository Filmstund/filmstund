import React from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";

const TopBarContainer = styled.div`
  background: maroon;
  padding: 1em 0;
`;

const Link = styled(RouterLink)`
  padding: 1em;
  color: white;
  text-decoration: none;
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
        <Link to="/">Hem</Link>
        <Link to="/showings">Visningar</Link>
        <Link to="/user">Användare</Link>
      </TopBarContainer>
    );
  }
});

export default TopBar;
