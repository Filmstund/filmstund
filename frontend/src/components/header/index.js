import React from 'react';

import { connect } from 'react-redux';

import { getUser, getSession } from '../../store/reducer'
import { signOut } from '../../store/actions'

import Quotationsbar from './quotationsbar';
import Navbar from './navbar';
import styles from './style.css';

const Header = React.createClass({
  signOut() {
    this.props.dispatch(signOut());
  },
  render() {
    const { signedIn, user } = this.props

    return (
      <div className={styles.container}>
        <Navbar user={user} signedIn={signedIn}/>
        <Quotationsbar />
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
