import React from 'react';
import loader from '../loader/';
import { withRouter } from 'react-router';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';

import styles from './style.css'

const minDate = moment();

const Showing = React.createClass({
  getInitialState() {
    return {
      timeRange: {
        startDate: minDate,
        endDate: moment().add(3, 'weeks'),
      },
      loading: false
    }
  },

  submitSlotsPicked() {
  },

  render() {
    const { loading, timeSlots } = this.state;
    const { showing } = this.props.showing;

    if (!showing) {
      return null;
    }

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${showing.movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{showing.movie.title}</h3>
          {loading && <img src="/loader.gif" />}
        </div>
      </div>
    )
  }
})

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`
}
))(Showing))
