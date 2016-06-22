import React from 'react';

import styles from './style.css';

const MovieItem = React.createClass({
  render() {
    const { movie } = this.props

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${movie.poster})`}}></div>
        <div className={styles.description}>
          <div className={styles.header}>
              {movie.imdb_id &&
                <a href={`http://www.imdb.com/title/${movie.imdb_id}/`} className={styles.imdbLogo}>
                  <img src='/IMDb_logo.svg' />
                </a>
              }
            <h3> {movie.title} </h3>
          </div>
          {movie.description}
          <div className={styles.footer}>wey</div>
        </div>
      </div>
    )
  }
})


export default MovieItem
