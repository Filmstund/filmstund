import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink as RouterLink, withRouter } from "react-router-dom";
import styled from "styled-components";
import { me } from "./store/reducers";
import fetch, { BASE_URL } from "./lib/fetch";

const TopBarContainer = styled.div`
  background: maroon;
  padding: 1em 0;
`;

const ExternalLink = styled.a`
  padding: 1em;
  color: white;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: lightgray;
    background: darkred;
  }
`

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

class TopBar extends Component {
  handleLogout = () => {
    this.props.dispatch(me.actions.clearSingle());
    fetch(BASE_URL + "/logout");
  }
  render() {
    const { signedIn } = this.props;

    return (
      <TopBarContainer>
        <Link to="/">Hem</Link>
        <Link to="/user">Användare</Link>
        <Link to="/movies">Filmer</Link>
        {signedIn && <ExternalLink onClick={this.handleLogout}>Logga ut</ExternalLink>}
      </TopBarContainer>
    );
  }
}

export default withRouter(connect(state => ({ signedIn: !!state.me.data.id }))(TopBar));
