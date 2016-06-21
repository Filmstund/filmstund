import React from 'react';
import styles from './style.css';
import {Link} from 'react-router';

console.log(styles);

const Navbar = React.createClass({
  render() {
    return (
        <div className={styles.navbar}>
          <img src="./logo.svg" alt="ITbio logo"/>
          <ul>
            <li><Link to="/showings" activeClassName={styles.activeLink}>Besök</Link></li>
            <li><Link to="/movies" activeClassName={styles.activeLink}>Filmer</Link></li>
            <li><Link to="/user" activeClassName={styles.activeLink}>Användare</Link></li>
          </ul>
        </div>
    )
  }
})

 export default Navbar
