import React from 'react';
import styles from './style.css';
import { Link, withRouter } from 'react-router';

import { connect } from 'react-redux';
import { signOut } from '../../../store/actions'

const Navbar = React.createClass({
  signOut() {
    this.props.dispatch(signOut());
    this.props.router.push(`/start`);
  },
  render() {
    const { user, signedIn } = this.props
    return (
        <div className={styles.navbar}>
          <div className={styles.left}>
            <img src="/logo.svg" alt="ITbio logo"/>
            <ul>
              <li><Link to="/showings" activeClassName={styles.activeLink}>Besök</Link></li>
              <li><Link to="/movies" activeClassName={styles.activeLink}>Filmer</Link></li>
              {signedIn &&
                <li><Link to="/user" activeClassName={styles.activeLink}>{user.nick}</Link></li>
              }
            </ul>
          </div>
          <div className={styles.right}>
          {signedIn &&
            <a href="#" onClick={this.signOut} className={styles.signOut}><i className="fa fa-sign-out" aria-hidden="true"></i> Logga ut</a>
          }
          </div>
        </div>
    )
  }
})

 export default withRouter(connect()(Navbar))
