import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import background from "../assets/body_background.jpg";
import googleIcon from "../assets/google-logo.svg";
import {
  setUserInfo,
  clearSession,
  getGoogleId,
  hasToken
} from "../lib/session";
import { provideGoogleLogin } from "../GoogleLoginProvider";

const LoginContainer = styled.div`
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  min-height: 100%;
  background-image: url(${background});
  background-repeat: no-repeat;
  background-color: black;
  justify-content: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
  flex-direction: column;
  background: white;
  max-width: 60em;
`;

const LoginDialog = styled.div`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  padding: 2em;
  background-color: #fff;
  border: solid 1px #9e9e9e;
  border-radius: 3px;
  text-align: center;
`;

const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
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
  state = {
    signedIn: hasToken()
  };

  componentDidMount() {
    this.props
      .initGoogleAuth({
        loginHint: getGoogleId(),
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
      })
      .then(this.googleUserChanged);
  }

  googleAuthSuccess = user => {
    if (this.props.location.pathname === "/login") {
      this.props.history.push("/");
    }
  };

  googleUserChanged = response => {
    if (response.user_id) {
      setUserInfo(response);

      this.setState({
        signedIn: true
      });
    } else {
      clearSession();
      this.setState({
        signedIn: false
      });
    }

    return response;
  };

  signin = () => {
    this.props
      .signIn()
      .then(this.googleUserChanged)
      .then(this.googleAuthSuccess);
  };

  signout = () => {
    clearSession();
    this.props.signOut();

    this.setState({
      signedIn: false
    });

    this.props.history.push("/login");
  };

  render() {
    const { signedIn } = this.state;
    const { children } = this.props;

    if (signedIn) {
      return (
        <Container>
          <ContentContainer>
            {children({ signout: this.signout })}
          </ContentContainer>
        </Container>
      );
    }

    return (
      <Container>
        <LoginContainer>
          <LoginDialog>
            <img
              src={require("../assets/logo.png")}
              height="260"
              alt="IT-bio logga"
            />
            <h3>Logga in för att boka biobesök!</h3>
            <GoogleButton onClick={this.signin}>
              <GoogleLogo src={googleIcon} /> Logga in via Google
            </GoogleButton>
          </LoginDialog>
        </LoginContainer>
      </Container>
    );
  }
}

export default compose(withRouter, provideGoogleLogin)(Login);
