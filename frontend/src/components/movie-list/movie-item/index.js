import React from 'react';

import styles from './style.css'

const MovieItem = React.createClass({
  render() {
    const { movie } = this.props

    return (
      <div className={styles.container}>
        <a href={"http://www.imdb.com/title/" + movie.imdbId}>
          {movie.name}
        </a>
      </div>
    )
  }
})


export default MovieItem