import React from 'react';

import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import Quotationsbar from './quotationsbar';
import Navbar from './navbar';
import styles from './style.css';

const Header = React.createClass({
  handleGoogleAuthCallback(params) {

  },
  handleFacebookAuthCallback(params) {
    console.log(params);
    return this.handleAuthCallback({
      token: params.accessToken,
      user_id: params.userID,
      provider: 'facebook'
    })
  },
  handleAuthCallback(params) {
    console.log(params);

    if (!params.token || !params.user_id) {
      throw 'Authentication failure - no token received'
    }
    const postBody = Object.keys(params).reduce((formData, key) => {
      formData.append(key, params[key])
      return formData
    }, new FormData())

    fetch('/api/authenticate', {
      method: 'post',
      body: postBody
    })
  },
  render() {
    return (
      <div className={styles.container}>
        <Navbar/>
        <Quotationsbar />
        <GoogleLogin
          clientId="692064172675-montab9pi57304e68r932c6lm7111oaf.apps.googleusercontent.com"
          scope="profile email"
          callback={this.handleGoogleAuthCallback}
        />
        <FacebookLogin
          appId="241451712906812"
          scope="email,public_profile"
          callback={this.handleFacebookAuthCallback}
        />
      </div>
    )
  }
})


export default Header
