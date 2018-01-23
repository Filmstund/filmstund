import React, { Component } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import styled from "styled-components";

const TopBarContainer = styled.div`
  background-color: #b71c1c;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const GoogleLogoutLink = styled.a`
  padding: 0.8rem;
  color: white;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background-color: #c62828;
  }
`;

const Link = styled(RouterLink)`
  padding: 0.8rem;
  color: white;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background-color: #c62828;
  }
`;

class TopBar extends Component {
  render() {
    const { signout } = this.props;
    return (
      <TopBarContainer>
        <div>
          <Link to="/">Mina besök</Link>
          <Link to="/showings">Alla besök</Link>
        </div>
        <div>
          <Link to="/user">Profil</Link>
          <GoogleLogoutLink onClick={signout}>Logga ut</GoogleLogoutLink>
        </div>
      </TopBarContainer>
    );
  }
}

export default TopBar;
