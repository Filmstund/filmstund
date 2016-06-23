import React from 'react';
import styles from './style.css';
import {Link} from 'react-router';

const Navbar = React.createClass({
  render() {
    const { user, signedIn } = this.props
    return (
        <div className={styles.navbar}>
          <img src="/logo.svg" alt="ITbio logo"/>
          <ul>
            <li><Link to="/showings" activeClassName={styles.activeLink}>Besök</Link></li>
            <li><Link to="/movies" activeClassName={styles.activeLink}>Filmer</Link></li>
            <li><Link to="/user" activeClassName={styles.activeLink}>Användare</Link></li>
            {signedIn && <li>{user.nick}</li>}
          </ul>
        </div>
    )
  }
})

 export default Navbar
