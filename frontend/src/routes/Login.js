import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { BASE_URL } from "../lib/fetch";
import { me } from "../store/reducers";

const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .25);
  font-family: Roboto;
  background-color: #fff;
  color: #757575;
`;

class Login extends Component {
  handleGoogleRedirect = () => {
    window.location =
      BASE_URL +
      "/login/google?redirect=" +
      encodeURIComponent(window.location.pathname);
  };

  render() {
    const { className } = this.props;
    return (
      <div className={className}>
        <div>Logga in för att boka biobesök!</div>
        <GoogleButton onClick={this.handleGoogleRedirect}>
          Logga in via Google
        </GoogleButton>
      </div>
    );
  }
}

export default connect(state => ({
  me: state.me
}))(Login);
