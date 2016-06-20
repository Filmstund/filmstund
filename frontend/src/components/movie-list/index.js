import React from 'react';
import MovieItem from './movie-item';

import styles from './style.css'

const MovieList = React.createClass({
  render() {
    const { movies } = this.props
    console.log('movies', movies);
    return (
      <div className={styles.container}>
        {movies.map(movie => <MovieItem movie={movie} key={movie.id} />)}
      </div>
    )
  }
})

export default MovieList
