import React from "react";
import { NavLink as RouterLink } from "react-router-dom";
import styled from "@emotion/styled";
import { noop } from "lodash-es";

const NavBarBackground = styled.div`
  background-color: #b71c1c;
  position: sticky;
  top: 0;
`;

const NavBarLinksContainer = styled.nav`
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

const NavBar = () => {
  return (
    <NavBarBackground>
      <NavBarLinksContainer>
        <div>
          <Link to="/">Mina besök</Link>
          <Link to="/showings">Alla besök</Link>
        </div>
        <div>
          <Link to="/user">Profil</Link>
          <GoogleLogoutLink onClick={noop}>Logga ut</GoogleLogoutLink>
        </div>
      </NavBarLinksContainer>
    </NavBarBackground>
  );
};

export default NavBar;
