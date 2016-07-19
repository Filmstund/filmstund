import React from 'react';
import loader from '../loader';

import StatusLabel from '../status-label';

import styles from './style.css';

const ShowingHeader = React.createClass({
  render() {
    const { showing } = this.props;

    return (
      <div className={styles.header}>
        <a href={`/showings/${showing.id}`} ><h2>{showing.movie.title}</h2></a>
        <div className={styles.statusLabel}><StatusLabel className={styles.label} status={showing.status} /></div>
      </div>
    )
  }
})


export default ShowingHeader
