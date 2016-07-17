import React from 'react';
import loader from '../loader/';
import { withRouter } from 'react-router';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';
import LoadingIndicator from '../loading-indicator';

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

  submitSlotsPicked(selectedIds) {
    console.log('slots picked', selectedIds);
    postEndpoint(`/showings/${this.props.params.id}/time_slots/votes`, {
      sf_slot_ids: selectedIds
    })
  },

  render() {
    const { showing } = this.props.showing;
    const { time_slots:selectedTimeSlots } = this.props.selectedTimeSlots;
    if (!showing || !selectedTimeSlots) {
      return null;
    }
    const { loading, time_slots, status } = showing;
    const initiallySelectedTimeSlots = this.props.selectedTimeSlots.time_slots;

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${showing.movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{showing.movie.title}</h3>
          {loading && <LoadingIndicator />}
          <StatusLabel status={status} />
          { time_slots && (
              <div>
                <SlotPicker timeSlots={time_slots}
                            initiallySelectedTimeSlots={selectedTimeSlots}
                            onSubmit={this.submitSlotsPicked} />
              </div>
          )}
        </div>
      </div>
    )
  }
})

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`,
    selectedTimeSlots: `/showings/${props.params.id}/time_slots/votes`
}
))(Showing))
