import React from 'react';
import moment from '../../../lib/moment'
import { connect } from 'react-redux';
import { putEndpoint } from '../../../service/backend';
import GoldButton from '../../gold-button';
import MovieInfo from '../../movie-info';

import styles from './style.css';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

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
    const { movie, onCreateShowing, selected, onMovieClick } = this.props

    const premiereDate = moment(movie.premiere_date);
    const premiereIsInFuture = premiereDate.isAfter(moment())

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          {this.renderImdbButton(movie, isEditing)}
          <h2 onClick={() => onMovieClick(movie.sf_id)}>{movie.title}</h2>
          {premiereIsInFuture
            &&
            <time dateTime={premiereDate.toISOString()}
                title={premiereDate.format('L')}>
            Premiär {premiereDate.fromNow()}
          </time>}
          <GoldButton onClick={onCreateShowing}>
            Skapa besök
          </GoldButton>
        </div>
        <ReactCSSTransitionGroup transitionName="slide" transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
          {selected && <MovieInfo movie={movie} />}
        </ReactCSSTransitionGroup>
      </div>

    )
  }
})


export default connect()(MovieItem)
