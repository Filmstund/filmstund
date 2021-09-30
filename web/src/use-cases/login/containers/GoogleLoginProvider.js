import React, { Component } from "react";

export const provideGoogleLogin = (component) =>
  class extends Component {
    state = {
      loaded: false,
    };

    componentDidMount() {
      const element = document.getElementsByTagName("script")[0];
      const fjs = element;
      let js = element;
      js = document.createElement("script");
      js.src = "//apis.google.com/js/client:platform.js";
      fjs.parentNode.insertBefore(js, fjs);
      js.onload = () => {
        window.gapi.load("auth2", () => {
          this.setState({
            loaded: true,
          });
        });
      };
    }

    initGoogleAuth = ({
      clientId,
      cookiePolicy,
      loginHint,
      hostedDomain,
      fetchBasicProfile,
      discoveryDocs,
      uxMode,
      redirectUri,
      scope,
    }) => {
      const params = {
        client_id: clientId,
        cookie_policy: cookiePolicy,
        login_hint: loginHint,
        hosted_domain: hostedDomain,
        fetch_basic_profile: fetchBasicProfile,
        discoveryDocs,
        ux_mode: uxMode,
        redirect_uri: redirectUri,
        scope,
      };

      return window.gapi.auth2.init(params).then((res) => {
        const user = res.currentUser.get();
        const auth = user.getAuthResponse();
        const response = {
          user_id: user.getId(),
          ...auth,
        };
        return response;
      });
    };

    signIn = () => {
      const auth2 = window.gapi.auth2.getAuthInstance();

      return auth2.signIn().then((user) => {
        const auth = user.getAuthResponse();
        const response = {
          user_id: user.getId(),
          ...auth,
        };

        return response;
      });
    };

    signOut = () => {
      const auth2 = window.gapi.auth2.getAuthInstance();

      return auth2.signOut();
    };

    render() {
      const { loaded } = this.state;

      if (loaded) {
        const C = component;

        return (
          <C
            {...this.props}
            signIn={this.signIn}
            signOut={this.signOut}
            initGoogleAuth={this.initGoogleAuth}
          />
        );
      } else {
        return null;
      }
    }
  };
