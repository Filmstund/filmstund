import React from 'react';
import moment from 'moment';

moment.locale('sv')

import styles from './style.css';

const MovieItem = React.createClass({
  render() {
    const { movie } = this.props

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${movie.poster})`}}></div>
        <div className={styles.description}>
          <div className={styles.header}>
            <div className={styles.leftSide}>
              {movie.imdb_id &&
                <a href={`http://www.imdb.com/title/${movie.imdb_id}/`} className={styles.imdbLogo}>
                  <img src='/IMDb_logo.svg' />
                </a>
              }
              <h3>{movie.title}</h3>
            </div>
            <div>
              <time dateTime={moment(movie.premiere_date).toISOString()} title={moment(movie.premiere_date).format('L')}>Premiär {moment(movie.premiere_date).fromNow()}</time>
            </div>
          </div>
          {movie.description}
          <div className={styles.footer}>wey</div>
        </div>
      </div>
    )
  }
})


export default MovieItem
