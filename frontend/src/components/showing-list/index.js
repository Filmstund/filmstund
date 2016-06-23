import React from 'react';
import ShowingItem from './showing-item';
import loader from '../loader';

import styles from './style.css';

const ShowingList = React.createClass({
  render() {
    const { showings, loading } = this.props;
    return (
      <div className={styles.container}>
        {(showings.showings || []).map(showing => <ShowingItem showing={showing} key={showing.id} />)}
      </div>
    )
  }
})

export default loader((props) => ({
  showings: '/showings'
}))(ShowingList)
