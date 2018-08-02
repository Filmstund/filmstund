import React, { Component } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faCalendar from "@fortawesome/fontawesome-free-solid/faCalendar";
import faFilm from "@fortawesome/fontawesome-free-solid/faFilm";
import faTicketAlt from "@fortawesome/fontawesome-free-solid/faTicketAlt";
import faUser from "@fortawesome/fontawesome-free-solid/faUser";
import { PageWidthWrapper } from "./PageWidthWrapper";

const NavBarLinksContainer = styled.div`
  background-color: #cd0121;
  display: flex;
  justify-content: space-between;
  @media screen and (min-width: 480px) {
    order: -1;
  }
`;

const Link = styled(RouterLink)`
  flex: 1;
  color: white;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background-color: #bb001d;
  }
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: .5rem;
`;

const NavIcon = styled(FontAwesomeIcon)`
  font-size: 1.75rem;
`;

const NavText = styled.div`
  text-transform: uppercase;
  font-size: .75rem;
  margin-top: .5em;
`;

class NavBar extends Component {
  render() {
    return (
      <NavBarLinksContainer>
        <Link to="/today">
          <NavItem>
            <NavIcon icon={faCalendar} />
            <NavText>Idag</NavText>
          </NavItem>
        </Link>
        <Link to="/">
          <NavItem>
            <NavIcon icon={faFilm} />
            <NavText>Filmer</NavText>
          </NavItem>
        </Link>
        <Link to="/showings">
          <NavItem>
            <NavIcon icon={faTicketAlt} />
            <NavText>Besök</NavText>
          </NavItem>
        </Link>
        <Link to="/user">
          <NavItem>
            <NavIcon icon={faUser} />
            <NavText>Konto</NavText>
          </NavItem>
        </Link>
      </NavBarLinksContainer>
    );
  }
}

export default NavBar;
