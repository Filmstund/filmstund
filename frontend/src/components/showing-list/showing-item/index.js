import React from 'react';
import { connect } from 'react-redux';

import ShowingHeader from '../../showing-header';
import MovieInfo from '../../movie-info';

import styles from './style.css';

const ShowingItem = React.createClass({
  render() {
    const { showing } = this.props;
    return (
      <div className={styles.container}>
        <ShowingHeader showing={showing} />
        <div className={styles.showingInfo}>
          Admin: {showing.owner.nick}
        </div>
        <MovieInfo movie={showing.movie} />
      </div>
    )
  }
})


export default connect((state, props) => ({
  showing: state.showings.showingMap[props.showingId]
}))(ShowingItem);
