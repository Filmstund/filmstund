import React from 'react';
import loader from '../../loader';

import StatusLabel from '../../status-label';
import MovieInfo from '../../movie-info';

import styles from './style.css';

const ShowingItem = React.createClass({
  render() {
    const { showing } = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <a href={`/showings/${showing.id}`} ><h2>{showing.movie.title}</h2></a>
          <div className={styles.statusLabel}><StatusLabel className={styles.label} status={showing.status} /></div>
        </div>
        <div className={styles.showingInfo}>
          Admin: {showing.owner.nick}
        </div>
        <MovieInfo movie={showing.movie} />
      </div>
    )
  }
})


export default ShowingItem
