import React from 'react';
import loader from '../../loader';

import ShowingHeader from '../../showing-header';
import MovieInfo from '../../movie-info';

import styles from './style.css';

const ShowingItem = React.createClass({
  render() {
    const { showing } = this.props;

    return (
      <div className={styles.container}>
        <ShowingHeader showing={showing} />
        <div className={styles.showingInfo}>
          Admin: {showing.owner.nick}
        </div>
        <MovieInfo movie={showing.movie} />
      </div>
    )
  }
})


export default ShowingItem
