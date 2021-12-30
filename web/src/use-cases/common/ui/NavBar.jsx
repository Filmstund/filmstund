import React from "react";
import { NavLink as ReactRouterLink } from "react-router-dom";
import styled from "@emotion/styled";

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

const Link = styled.a`
  padding: 0.8rem;
  color: white;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background-color: #c62828;
  }
`;

const InternalLink = styled(ReactRouterLink)`
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
          <InternalLink to="/">Mina besök</InternalLink>
          <InternalLink to="/showings">Alla besök</InternalLink>
        </div>
        <div>
          <InternalLink to="/user">Profil</InternalLink>
          <Link href="/logout">Logga ut</Link>
        </div>
      </NavBarLinksContainer>
    </NavBarBackground>
  );
};

export default NavBar;
