import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { DateRange } from 'react-date-range';
import { postEndpoint } from '../../service/backend';
import { HorizontalBar } from 'react-chartjs-2';

import _ from 'lodash';

import ShowingHeader from '../showing-header';
import MovieInfo from '../movie-info';
import SlotPicker from '../slot-picker';
import UserList from './user-list';
import VotingChart from './voting-chart';

import styles from './style.css'
import { getUser } from "../../store/reducer";
import { fetchShowing, fetchTimeSlotsForShowing, postAttendStatusChange } from "../../store/actions";

import format from './formatter';

const Showing = React.createClass({
  propTypes: {
    showing: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    selectedTimeSlots: PropTypes.object
  },

  getInitialState() {
    return {
      loading: false,
      slotsSaved: false
    }
  },

  componentWillMount() {
    this.props.dispatch(
      fetchShowing(this.props.params.id)
    )
    this.props.dispatch(
      fetchTimeSlotsForShowing(this.props.params.id)
    )
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
      ids: selectedIds
    }).then(data => {
      this.setState({
        loading: false,
        timeSlots: data.time_slots
      });
    }).catch((err) => {
      err.json().then((x) => {
        console.log(x);
      })
    });
  },

  onBarClicked() {
    console.log(arguments);
  },

  renderSubmitTimeSlotButtons(time_slots, selected_time_slot) {

    return (
      <div className={styles.slotButtonContainer}>
        {
          time_slots.map(ts => {
            const buttonClasses = [styles.timeSlotButton];
            if (selected_time_slot && ts.sf_slot_id === selected_time_slot.sf_slot_id) {
              buttonClasses.push(styles.selected)
            }
            return <div className={buttonClasses.join(' ')} key={ts.sf_slot_id}
                    onClick={() => this.submitTimeSlot(ts.id)}></div>
          })
        }
      </div>
    )
  },

  renderAttendButton() {
    const { showing } = this.props;
    const isAttending = showing.attendees.find(attendee => attendee.user_id == this.props.currentUser.id);

    return (
      <label>
        <input type="checkbox" onClick={isAttending ? this.unAttendShowing : this.doAttendShowing} checked={Boolean(isAttending)} /> Jag kommer
      </label>
    )
  },

  doAttendShowing() {
    this.props.dispatch(
      postAttendStatusChange(this.props.params.id, 'attend')
    )
  },

  unAttendShowing() {
    this.props.dispatch(
      postAttendStatusChange(this.props.params.id, 'unattend')
    )
  },

  submitTimeSlot(slot_id) {
    this.props.update('showing', postEndpoint(`/showings/${this.props.params.id}/complete`, { slot_id }))
  },

  render() {
    const { showing, currentUser, time_slots: selectedTimeSlots } = this.props;
    const votingUsers = _(showing.attendees).uniqBy('id').value();

    if (!showing || !selectedTimeSlots) {
      return null;
    }

    let { time_slots } = showing;

    time_slots = _.orderBy(time_slots, "start_time");

    return (
      <div className={styles.container}>
        <ShowingHeader showing={showing} />
        <div className={styles.showingInfo}>
          Admin: {showing.owner.nick}
        </div>
        {showing.selected_time_slot && (
          <div>Bestämt besöksdatum är {format(showing.selected_time_slot.start_time, showing.selected_time_slot.is_3d, showing.selected_time_slot.is_vip)}</div>
        )}
        <div className={styles.timePicker}>
          {!showing.selected_time_slot && (
            time_slots && (
              <div>
                <SlotPicker timeSlots={time_slots}
                            initiallySelectedTimeSlots={selectedTimeSlots}
                            onChange={this.submitSlotsPicked}
                            getId={(slot) => slot.id}
                            userId={currentUser.id}
                            showUsers={true} />
              </div>
            )
          )}
          {!showing.selected_time_slot && (
            <div>Pick a date! Any date!</div>
          )}
          <div className={styles.buttonAndGraphContainer}>
            {showing.owner.id === currentUser.id && (this.renderSubmitTimeSlotButtons(time_slots, showing.selected_time_slot))}
            <VotingChart timeSlots={time_slots} selectedId={showing.selected_time_slot && showing.selected_time_slot.id}/>
          </div>
          <h3>Deltagare</h3>
          {this.renderAttendButton()}
          <UserList users={votingUsers} />
        </div>
        <h3>Om filmen</h3>
        <MovieInfo movie={showing.movie} />
      </div>
    )
  }
});

export default withRouter(connect((state, props) => ({
    currentUser: getUser(state),
    showing: state.showings.showings[props.params.id],
    time_slots: state.showings.time_slots[props.params.id]
}))(Showing))
