import React, { Component } from "react";
import styled from "styled-components";
import { BASE_URL } from "../lib/withBaseURL";
import background from "../assets/body_background.jpg";

const LoginContainer = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${background});
  background-size: cover;
`;

const LoginDialog = styled.div`
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.25);
  padding: 2em;
  background-color: #fff;
  border: solid 1px #9e9e9e;
  border-radius: 3px;
  text-align: center;
`;

const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.25);
  padding: 0.5em 1em;
  font-family: Roboto, sans-serif;
  font-size: 12pt;
  background-color: #fff;
  color: #212121;
  cursor: pointer;
  border: solid 1px #9e9e9e;
  border-radius: 3px;
  
  &:hover {
    background-color: #fafafa;
  }
`;

const GoogleLogo = styled.img`
  display: inline;
  height: 2em;
  vertical-align: middle;
  margin-right: 0.7em;
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
      <LoginContainer className={className}>
        <LoginDialog className={className}>
          <img src={require('../assets/logo.png')} alt="IT-bio logga" />
          <h3>Logga in för att boka biobesök!</h3>
          <GoogleButton onClick={this.handleGoogleRedirect}>
            <GoogleLogo src={require('../assets/google-logo.svg')} />
            Logga in via Google
          </GoogleButton>
        </LoginDialog>
      </LoginContainer>
    );
  }
}

export default Login;
