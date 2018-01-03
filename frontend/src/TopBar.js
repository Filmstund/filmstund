import React, { Component } from "react";
import { NavLink as RouterLink, withRouter } from "react-router-dom";
import styled from "styled-components";
import { me } from "./store/reducers";
import { signoutUser } from "./store/reducers/user";
import fetch from "./lib/fetch";
import { BASE_URL } from "./lib/withBaseURL";

const TopBarContainer = styled.div`
  background-color: #b71c1c;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const ExternalLink = styled.a`
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
  handleLogout = () => {
    this.props.dispatch(me.actions.clearSingle());
    this.props.dispatch(signoutUser());
    fetch(BASE_URL + "/logout");
  };
  render() {
    const { signedIn } = this.props;

    return (
      <TopBarContainer>
        <div>
          <Link to="/">Mina besök</Link>
          <Link to="/showings">Alla besök</Link>
        </div>
        <div>
          <Link to="/user">Profil</Link>
          {signedIn && (
            <ExternalLink href="#" tabIndex="0" onClick={this.handleLogout}>
              Logga ut
            </ExternalLink>
          )}
        </div>
      </TopBarContainer>
    );
  }
}

export default withRouter(TopBar);
