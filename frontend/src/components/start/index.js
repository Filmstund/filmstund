import React from 'react';

import { connect } from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';

import { withRouter } from 'react-router';

import { transformFacebookAuthCallback, transformGoogleAuthCallback } from '../../lib/auth'
import { getUser, getSession } from '../../store/reducer'
import { signIn } from '../../store/actions'
import { browserHistory } from 'react-router';
import App from '../../App';
import ShowingList from '../showing-list';

import styles from './style.css'

const Start = React.createClass({
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
      this.props.dispatch(signIn(params));
      this.props.router.push(`/showings`);
    }
  },
  render() {
    const { signedIn, user } = this.props;

    if (this.props.signedIn) {
      return <App><ShowingList /></App>
    }

    return (
      <div className={styles.container}>
        <img src="./logo.svg" alt="ITbio logo"/>
        <div className={styles.login}>
          <h1>Logga in</h1>
          <hr/>
          <div className={styles.loginButtons}>
            {!signedIn &&
            <GoogleLogin
              clientId="692064172675-montab9pi57304e68r932c6lm7111oaf.apps.googleusercontent.com"
              scope="profile email"
              callback={this.handleGoogleAuthCallback}
              cssClass="google-login"
              textButton=""
            />}
            {!signedIn &&
            <FacebookLogin
              appId="241451712906812"
              scope="email"
              callback={this.handleFacebookAuthCallback}
              cssClass="fb-login"
              textButton=""
            />}
          </div>
        </div>
      </div>
    )
  }
})


export default withRouter(connect(state => ({
  user: getUser(state),
  signedIn: getSession(state).signedIn
}))(Start))
