import React from 'react';
import loader from '../loader/';
import moment from 'moment';
import { withRouter } from 'react-router';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';
import HorizontalBarGraph from './HorizontalBarGraph';

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';

import styles from './style.css'

const Showing = React.createClass({
  getInitialState() {
    return {
      votingStats: []
    }
  },

  submitSlotsPicked(selectedIds) {
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
    const barData = showing.time_slots.map((ts) => ({
      x: moment(ts.start_time).format('DD/M, HH:mm'),
      y: ts.users.length,
      id: ts.id
    }))


    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${showing.movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{showing.movie.title}</h3>
          {loading && <img src="/loader.gif" />}
          <StatusLabel status={status} />
          { time_slots && (
              <div>
                <SlotPicker timeSlots={time_slots}
                            initiallySelectedTimeSlots={selectedTimeSlots}
                            onSubmit={this.submitSlotsPicked} />
              </div>
          )}

          <HorizontalBarGraph data={barData}/>

        </div>
      </div>
    )
  }
});

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`,
    selectedTimeSlots: `/showings/${props.params.id}/time_slots/votes`
}
))(Showing))
