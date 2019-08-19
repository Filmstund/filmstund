import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import googleIcon from "./assets/google-logo.svg";
import itbioLogo from "./assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import {
  setUserInfo,
  clearSession,
  getGoogleId,
  hasToken
} from "../../../lib/session";
import { provideGoogleLogin } from "./GoogleLoginProvider";
import {
  Container,
  ContentContainer,
  LoginContainer,
  ErrorBox,
  LoginDialog,
  GoogleButton,
  GoogleLogo
} from "../components/login-styles";

class Login extends Component {
  state = {
    signedIn: hasToken(),
    loaded: false,
    cookiesBlocked: false
  };

  componentDidMount() {
    return this.props
      .initGoogleAuth({
        loginHint: getGoogleId(),
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
      })
      .then(this.googleUserChanged)
      .catch(e => {
        if (e.error === "idpiframe_initialization_failed") {
          this.setState({
            cookiesBlocked: true
          });
        } else {
          throw e;
        }
      })
      .then(() => {
        this.setState({
          loaded: true
        });
      });
  }

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
    this.props.signIn().then(this.googleUserChanged);
  };

  signout = () => {
    clearSession();
    this.props.signOut();

    this.setState({
      signedIn: false
    });

    this.props.history.push("/");
  };

  render() {
    const { signedIn, cookiesBlocked, loaded } = this.state;
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
          {cookiesBlocked && (
            <ErrorBox>
              Du verkar ha blockerat tredjepartskakor, vänligen vitlista kakor
              från "accounts.google.com" för att kunna logga in!
            </ErrorBox>
          )}
          <LoginDialog>
            <img src={itbioLogo} height="260" alt="IT-bio logga" />
            <h3>Logga in för att boka biobesök!</h3>
            {loaded ? (
              !cookiesBlocked && (
                <GoogleButton onClick={this.signin}>
                  <GoogleLogo src={googleIcon} /> Logga in via Google
                </GoogleButton>
              )
            ) : (
              <FontAwesomeIcon
                color="#d0021b"
                size="3x"
                icon={faCircleNotch}
                spin
              />
            )}
          </LoginDialog>
        </LoginContainer>
      </Container>
    );
  }
}

export default compose(
  withRouter,
  provideGoogleLogin
)(Login);
