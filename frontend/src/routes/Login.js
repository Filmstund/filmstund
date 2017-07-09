import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { BASE_URL } from "../lib/withBaseURL";
import qs from "qs";
import background from "../assets/body_background.jpg";

const LoginContainer = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${background});
  background-size: cover;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  height: 100vh;
`;

const LoginDialog = styled.div`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .25);
  padding: 2em;
  background-color: #fff;
  border: solid 1px #9e9e9e;
  border-radius: 3px;
  text-align: center;
`;

const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .25);
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

const getRedirectUrl = searchString => {
  if (searchString && searchString.length > 0) {
    return qs.parse(searchString.substr(1)).return_to;
  }
};

class Login extends Component {
  handleGoogleRedirect = () => {
    const redirectParam = getRedirectUrl(this.props.location.search);

    window.location =
      BASE_URL +
      `/login/google?redirect=${encodeURIComponent(redirectParam || "/")}`;
  };

  render() {
    const { children, className, signedIn } = this.props;

    if (signedIn) {
      return (
        <Container>
          {children}
        </Container>
      );
    }

    return (
      <Container>
        <LoginContainer className={className}>
          <LoginDialog className={className}>
            <img src={require("../assets/logo.png")} alt="IT-bio logga" />
            <h3>Logga in för att boka biobesök!</h3>
            <GoogleButton onClick={this.handleGoogleRedirect}>
              <GoogleLogo src={require("../assets/google-logo.svg")} />
              Logga in via Google
            </GoogleButton>
          </LoginDialog>
        </LoginContainer>
      </Container>
    );
  }
}

export default withRouter(Login);
