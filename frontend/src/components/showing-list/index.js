import React from 'react';
import { connect } from 'react-redux';
import ShowingItem from './showing-item';
import { fetchShowings } from '../../store/actions'

import styles from './style.css';

const ShowingList = React.createClass({
  componentWillMount() {
    this.props.dispatch(fetchShowings());
  },
  render() {
    const { showings, loading } = this.props;
    const showingIds = Object.keys(showings)

    return (
      <div className={styles.container}>
        {showingIds.map(showingId => <ShowingItem showingId={showingId} key={showingId} />)}
      </div>
    )
  }
})

export default connect((state) => ({
  showings: state.showings.showingMap
}))(ShowingList)
