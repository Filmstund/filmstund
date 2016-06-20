import React from 'react';
import styles from './style.css';
import {Link} from 'react-router';

const Navbar = React.createClass({
  render() {
    return (
        <ul className={styles.navbar}>
          <li><Link to="/movies">Besök</Link></li>
          <li><Link to="/search">Sök</Link></li>
          <li><Link to="/user">Användare</Link></li>
        </ul>
    )
  }
})

 export default Navbar
