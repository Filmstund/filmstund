import React from 'react';

import Quotationsbar from './quotationsbar';
import Navbar from './navbar';
import styles from './style.css';

const Header = React.createClass({
  render() {
    return (
      <div className={styles.container}>
        <img src="./logo.svg" alt="ITbio logo"/>
        <Navbar/>
        <Quotationsbar />
      </div>
    )
  }
})


export default Header
