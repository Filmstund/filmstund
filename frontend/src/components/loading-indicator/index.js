import React from 'react';

import styles from './style.css'

const LoadingIndicator = React.createClass({
  render() {
    return(
      <div className={styles.container}>
        <img src="/loader.gif" />
      </div>
    )
  }
});

export default LoadingIndicator
