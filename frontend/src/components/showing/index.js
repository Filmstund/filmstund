import React from 'react';
import loader from '../loader/';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';
import HorizontalBarGraph from './HorizontalBarGraph';

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';

import styles from './style.css'
import {getUser} from "../../store/reducer/index";

const Showing = React.createClass({
  getInitialState() {
    return {
      votingStats: []
    }
  },

  calculateNewVotesFromPickedSlots(selectedIds) {
    const allTimeSlotsWithoutUsersVotes = this.props.showing.showing.time_slots.map(ts => ({
      ...ts,
      users: ts.users.filter(u => u.id != this.props.currentUser.id)
    }));

    const newTimeSlots = allTimeSlotsWithoutUsersVotes.map(ts => {
      if (selectedIds.includes(ts.sf_slot_id)) {
        ts.users.push(this.props.currentUser)
      }
      return ts;
    });


    return newTimeSlots;
  },

  submitSlotsPicked(selectedIds) {
    this.setState({
      loading: true,
      timeSlots: this.calculateNewVotesFromPickedSlots(selectedIds)
    });

    postEndpoint(`/showings/${this.props.params.id}/time_slots/votes`, {
      sf_slot_ids: selectedIds
    }).then(data => {
      this.setState({
        loading: false,
        timeSlots: data.time_slots
      });
    });
  },

  onBarClicked(id) {
    //postEndpoint(`/sh`)
    console.log(id);
  },

  render() {
    const { showing } = this.props.showing;
    const { time_slots:selectedTimeSlots } = this.props.selectedTimeSlots;
    if (!showing || !selectedTimeSlots) {
      return null;
    }

    const { loading, status } = showing;
    let { time_slots } = showing;
    if (this.state.timeSlots) {
      time_slots = this.state.timeSlots;
    }
    const barData = time_slots.map((ts) => ({
      x: moment(ts.start_time).format('DD/M, HH:mm'),
      y: ts.users.length,
      id: ts.id
    }));


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

          <HorizontalBarGraph data={barData} onDataClicked={this.onBarClicked} />

        </div>
      </div>
    )
  }
});

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`,
    selectedTimeSlots: `/showings/${props.params.id}/time_slots/votes`
}
))(connect(state => ({
  currentUser: getUser(state)
}))(Showing)))
