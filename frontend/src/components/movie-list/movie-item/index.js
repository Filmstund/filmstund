import React from 'react';
import moment from '../../../lib/moment'
import { connect } from 'react-redux';
import { putEndpoint, postEndpoint } from '../../../service/backend';
import GoldButton from '../../gold-button';

import styles from './style.css';

const MovieItem = React.createClass({
  getInitialState() {
    return {
      isEditing: false
    }
  },
  setEdit() {
    this.setState({
      isEditing: true
    })
  },
  handleSubmitImdbId(e) {
    e.preventDefault()

    const movie = this.props.movie
    const imdb_id = this.imdbIdInput.value

    putEndpoint(`/movies/${movie.sf_id}`, { movie: { imdb_id } })
    .then(() => {
      movie.imdb_id = imdb_id
      this.setState({
        isEditing: false
      })
    })
  },
  renderImdbButton(movie, isEditing) {
    if (isEditing) {
      return (
        <form onSubmit={this.handleSubmitImdbId} className={styles.imdbLogo}>
          <input type="text" ref={(el) => this.imdbIdInput = el} />
          <button>Submit</button>
        </form>
      )
    } else if (movie.imdb_id) {
      return (
        <a href={`http://www.imdb.com/title/${movie.imdb_id}/`} className={styles.imdbLogo}>
          <img src="/IMDb_logo.svg" />
        </a>
      )
    } else {
      return (
        <div className={styles.imdbLogo + ' ' + styles.inactiveLogo} onClick={this.setEdit}>
          <img src="/IMDb_logo.svg" />
        </div>
      )
    }
  },
  render() {
    const { isEditing } = this.state
    const { movie } = this.props

    return (
      <div className={styles.container}>
        {this.renderImdbButton(movie, isEditing)}
        <h2>{movie.title}</h2>
        <time dateTime={moment(movie.premiere_date).toISOString()}
              title={moment(movie.premiere_date).format('L')}>
          Premiär {moment(movie.premiere_date).fromNow()}
        </time>
        <GoldButton onClick={() => this.createShowing(movie)}>
          Skapa besök
        </GoldButton>
      </div>
    )
  },
  createShowing(movie) {
    postEndpoint('/showings', {
      sf_id: movie.sf_id,
      status: 1
    }).then((resp) => {
      window.location = '/showings';
      console.log('resp', resp);
    });
  }
})


export default connect()(MovieItem)
