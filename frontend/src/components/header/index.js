import React from 'react';

import { connect } from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import { transformFacebookAuthCallback, transformGoogleAuthCallback } from '../../lib/auth'
import { getUser, getSession } from '../../store/reducer'
import { signIn, signOut } from '../../store/actions'

import Quotationsbar from './quotationsbar';
import Navbar from './navbar';
import styles from './style.css';

const Header = React.createClass({
  handleGoogleAuthCallback(params) {
    return this.handleAuthCallback(transformGoogleAuthCallback(params))
  },
  handleFacebookAuthCallback(params) {
    return this.handleAuthCallback(transformFacebookAuthCallback(params))
  },
  handleAuthCallback(params) {
    if (!params.token || !params.user_id) {
      throw 'Authentication failure - no token received'
    } else {
      this.props.dispatch(signIn(params))
    }
  },
  signOut() {
    this.props.dispatch(signOut());
  },
  render() {
    const { signedIn, user } = this.props

    return (
      <div className={styles.container}>
        <Navbar user={user} signedIn={signedIn}/>
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


export default connect(state => ({
  user: getUser(state),
  signedIn: getSession(state).signedIn
}))(Header)
