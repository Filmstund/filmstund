import React, { Component } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { PageWidthWrapper } from "./PageWidthWrapper";

const TopBarBackground = styled.div`
  background-color: #b71c1c;
  position: sticky;
  top: 0;
  z-index: 1;
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
        <PageWidthWrapper>
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
        </PageWidthWrapper>
      </TopBarBackground>
    );
  }
}

export default TopBar;
