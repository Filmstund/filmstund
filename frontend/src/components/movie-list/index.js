import React from 'react';
import MovieItem from './movie-item';
import loader from '../loader';

import styles from './style.css';

const MovieList = React.createClass({
  render() {
    const { movies, loading } = this.props;

    return (
      <div className={styles.container}>
        {(movies.movies || []).map(movie => <MovieItem movie={movie} key={movie.sf_id} />)}
      </div>
    )
  }
})

export default loader((props) => ({
  movies: '/movies'
}))(MovieList)
