import React from 'react';
import { withRouter } from 'react-router';
import MovieItem from './movie-item';
import loader from '../loader';
import { postEndpoint } from '../../service/backend';

import styles from './style.css';

const MovieList = React.createClass({
  render() {
    const { movies, loading } = this.props;

    return (
      <div className={styles.container}>
        <h1>Filmer</h1>
        {(movies.movies || []).map(movie => <MovieItem movie={movie} key={movie.sf_id} onCreateShowing={() => this.handleCreateShowing(movie)} />)}
      </div>
    )
  },
  handleCreateShowing(movie) {
    postEndpoint('/showings', {
      sf_id: movie.sf_id,
      status: 1
    }).then((resp) => {
      console.log('resp', resp);
      this.props.router.push('/showings/' + resp.showing.id);
    });
  }
})

export default withRouter(loader((props) => ({
  movies: '/movies'
}))(MovieList))
