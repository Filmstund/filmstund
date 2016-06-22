import React from 'react';

import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import Quotationsbar from './quotationsbar';
import Navbar from './navbar';
import styles from './style.css';

const fetchWithToken = (url) => {
  const token = localStorage.getItem('token')

  return fetch(url, {
    headers: {
      'Authorization': `Token token="${token}"`
    }
  }).then(d => d.json())
}

const Header = React.createClass({
  handleGoogleAuthCallback(params) {
    return this.handleAuthCallback({
      token: params.hg.id_token,
      user_id: params.wc.Ka,
      provider: 'google'
    })
  },
  handleFacebookAuthCallback(params) {
    return this.handleAuthCallback({
      token: params.accessToken,
      user_id: params.userID,
      provider: 'facebook'
    })
  },
  handleAuthCallback(params) {
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
    .then(d => d.json())
    .then(json => {
      console.log(json.token);
      localStorage.setItem('token', json.token)
      this.forceUpdate()

      fetch('/api/me', {
        headers: {
          'Authorization': `Token token="${json.token}"`
        }
      })
    })
  },
  signOut() {
    fetchWithToken('/api/signout').then(() => {
      localStorage.removeItem('token')
      this.forceUpdate()
    })
  },
  fetchMe() {
    fetchWithToken('/api/me')
  },
  render() {
    let signedIn = false;
    if (localStorage.getItem('token')) {
      signedIn = true;
    }

    return (
      <div className={styles.container}>
        <Navbar/>
        <Quotationsbar />
        {!signedIn &&
        <GoogleLogin
          clientId="692064172675-montab9pi57304e68r932c6lm7111oaf.apps.googleusercontent.com"
          scope="profile email"
          callback={this.handleGoogleAuthCallback}
        />}
        {!signedIn &&
        <FacebookLogin
          appId="241451712906812"
          scope="email"
          callback={this.handleFacebookAuthCallback}
        />}
        {signedIn &&
          <button onClick={this.signOut}>Sign out</button>
        }
        {signedIn &&
          <button onClick={this.fetchMe}>Fetch me</button>
        }
      </div>
    )
  }
})


export default Header
