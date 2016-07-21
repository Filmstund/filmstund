import React from 'react';

import { connect } from 'react-redux';

import { getUser, getSession } from '../../store/reducer'

import Quotationsbar from './quotationsbar';
import Navbar from './navbar';
import styles from './style.css';

const Header = React.createClass({
  render() {
    const { signedIn, user } = this.props

    return (
      <div className={styles.container}>
        <Navbar user={user} signedIn={signedIn}/>
        <Quotationsbar />
      </div>
    )
  }
})


export default connect(state => ({
  user: getUser(state),
  signedIn: getSession(state).signedIn
}))(Header)
