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
    console.log('slots picked');
  },

  render() {
    const { showing } = this.props.showing;
    if (!showing) {
      return null;
    }
    const { loading, time_slots, status } = showing;
    console.log(time_slots)

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${showing.movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{showing.movie.title}</h3>
          {loading && <img src="/loader.gif" />}
          <StatusLabel status={status} />
          { time_slots && (
              <div>
                <SlotPicker timeSlots={time_slots} onChange={this.pickedSlotUpdate} />
                <button onClick={this.submitSlotsPicked}>Submit</button>
              </div>
          )}
        </div>
      </div>
    )
  }
})

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`
}
))(Showing))
