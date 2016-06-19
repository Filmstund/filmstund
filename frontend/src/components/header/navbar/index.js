import React from 'react';
import styles from './style.css';

const Navbar = React.createClass({
  render() {
    return (
        <ul className={styles.navbar}>
          <li><a>Besök</a></li>
          <li><a>Sök</a></li>
          <li><a>Användare</a></li>
        </ul>
    )
  }
})

 export default Navbar
