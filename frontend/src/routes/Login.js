import React, { Component } from "react";
import styled from "styled-components"
import { BASE_URL } from "../lib/fetch";

const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.25);
  font-family: Roboto;
  background-color: #fff;
  color: #757575;
`

class Login extends Component {
  handleGoogleRedirect = () => {
    window.location = BASE_URL + "/login/google";
  }

  render() {
    const { className } = this.props;
    return (
      <div className={className}>
        <div>You are not signed in.</div>
        <GoogleButton onClick={this.handleGoogleRedirect}>Sign in with Google</GoogleButton>
      </div>
    )
  }
}


export default Login