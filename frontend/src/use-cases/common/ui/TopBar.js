import React, { Component } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import styled from "styled-components";

const TopBarBackground = styled.div`
  background-color: #b71c1c;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
`;

const TopBarLinksContainer = styled.div`
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
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
      <TopBarBackground>
        <TopBarLinksContainer>
          <div>
            <Link to="/">Mina besök</Link>
            <Link to="/showings">Alla besök</Link>
          </div>
          <div>
            <Link to="/user">Profil</Link>
            <GoogleLogoutLink onClick={signout}>Logga ut</GoogleLogoutLink>
          </div>
        </TopBarLinksContainer>
      </TopBarBackground>
    );
  }
}

export default TopBar;
