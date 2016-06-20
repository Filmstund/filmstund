import React from 'react';
import MovieItem from './movie-item';

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

    fetch('/api/movies.json')
    .then(d => d.json())
    .then(movies => {
      this.setState({ movies, loading: false })
    }).catch(err => {
      this.setState({ loading: false })
      console.error(err)
    })
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
