import React from 'react';

import styles from './style.css';

const MovieItem = React.createClass({
  render() {
    const { movie } = this.props

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{movie.title}</h3>
          {movie.description}
        </div>
      </div>
    )
  }
})


export default MovieItem
