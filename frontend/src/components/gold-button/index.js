import React from 'react';

import styles from './style.css';

const GoldButton = React.createClass({
  render() {
    let {children, ...props} = this.props;

    return (
      <button className={styles.goldButton} {...props}>{children}</button>
    )
  }
})

export default GoldButton
