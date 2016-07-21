import React from 'react';

import styles from './style.css';

const MovieInfo = React.createClass({
  render() {
    let movie = this.props.movie;

    return(
      <div className={styles.extraInfo} key="extraInfo">
        <div className={styles.poster}>
          <img src={movie.poster} />
        </div>
        <div className={styles.desc}>
          <div>{movie.description}</div>
          <div className={styles.runtime}><i className="fa fa-film" aria-hidden="true"></i> {movie.runtime} min</div>
        </div>
      </div>
    )
  }
})

export default MovieInfo
