import React from 'react';
import MovieItem from './movie-item';
import {extendArrayFromEndpoint} from '../../service/backend.js';

import styles from './style.css';

const MovieList = React.createClass({
  getInitialState() {
    return {
      loading: false,
      movies: []
    }
  },
  componentWillMount() {
    this.setState({
      loading: true
    })

    extendArrayFromEndpoint(this.state.movies, 'movies')
      .then( res => this.setState({movies: res}) );
  },

  render() {
    const { movies } = this.state
    console.log('movies', movies);
    return (
      <div className={styles.container}>
        {movies.map(movie => <MovieItem movie={movie} key={movie.sf_id} />)}
      </div>
    )
  }
})

export default MovieList
