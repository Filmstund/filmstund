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
import GoldButton from '../gold-button';
import TimeSlotLabel from '../time-slot-label';

import styles from './style.css'
import { getUser } from "../../store/reducer";
import {
    fetchShowing,
    fetchTimeSlotsForShowing,
    postAttendStatusChange,
    postShowingOrdered,
    postShowingDone,
    submitSlotsPickedForShowing,
    submitTimeSlotForShowing
} from "../../store/actions";

import format from './formatter';
import moment from '../../lib/moment';

const Showing = React.createClass({
  propTypes: {
    showing: PropTypes.object,
    currentUser: PropTypes.object.isRequired,
    selectedTimeSlots: PropTypes.object
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
    const allTimeSlotsWithoutUsersVotes = this.props.showing.time_slots.map(ts => ({
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
    this.props.dispatch(
        submitSlotsPickedForShowing(this.props.params.id, selectedIds)
    )
  },

  onBarClicked() {
    console.log(arguments);
  },

  renderSubmitTimeSlotButtons(time_slots, selected_time_slot) {

    time_slots = time_slots.filter(ts => ts.users.length > 0);

    return (
      <div className={styles.slotButtonContainer}>
        {
          time_slots.map(ts => {
            const buttonClasses = [styles.timeSlotButton];
            if (selected_time_slot && ts.sf_slot_id === selected_time_slot.sf_slot_id) {
              buttonClasses.push(styles.selected)
            }
            return <div className={buttonClasses.join(' ')} key={ts.sf_slot_id}
                    onClick={() => this.submitTimeSlot(ts.id)} title="Välj"></div>
          })
        }
      </div>
    )
  },

  submitTimeSlot(slot_id) {
    this.props.dispatch(
        submitTimeSlotForShowing(this.props.params.id, slot_id)
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

  doOrder () {
    this.props.dispatch(
        postShowingOrdered(this.props.params.id)
    )
  },

  doDone () {
    this.props.dispatch(
        postShowingDone(this.props.params.id)
    )
  },

  renderSummary(showing) {
    return <div>
      {moment(showing.selected_time_slot.start_time).format("ddd D/M HH:mm")} på {showing.selected_time_slot.theatre}
      {showing.selected_time_slot.is_3d && (<TimeSlotLabel type="3d" />)}
      {showing.selected_time_slot.is_vip && (<TimeSlotLabel type="vip" />)}
    </div>
  },

  renderAttendeeList(showing, currentUser) {
    return <div className={styles.attendees}>
      <div className={styles.numberOfAttendees}>{showing.attendees.length} deltagare</div>
      <UserList attendees={showing.attendees}
                currentUser={currentUser}
                doAttendShowing={this.doAttendShowing}
                unAttendShowing={this.unAttendShowing} />
    </div>
  },

  renderSlotPicker(time_slots, user) {
    const selectedTimeSlotIds = time_slots.filter(ts => ts.users.map(u => u.id).includes(user.id)).map(ts => ts.id);

    return <div>
      Markera de tider du kan. Du blir automagiskt anmäld om en av dina tider vinner omröstningen.
      <div className={styles.timePicker}>
        <SlotPicker timeSlots={time_slots}
                    onChange={this.submitSlotsPicked}
                    getId={(slot) => slot.id}
                    selectedTimeSlotIds={selectedTimeSlotIds}
                    showUsers={true} />
      </div>
    </div>
  },

  renderResult(showing, time_slots, currentUser) {
    return <div>
      <h3>Resultat</h3>
      {showing.status !== "confirmed" && (
          <div title="(29 maj)">Välj ett datum, vilket som helst!</div>
      )}
      <div className={styles.buttonAndGraphContainer}>
        {showing.owner.id === currentUser.id && (this.renderSubmitTimeSlotButtons(time_slots, showing.selected_time_slot))}
        <VotingChart timeSlots={time_slots} selectedId={showing.selected_time_slot && showing.selected_time_slot.id}/>
      </div>
    </div>
  },

  renderActionButton(showing) {
    if (showing.status === "confirmed") {
      return <GoldButton onClick={this.doOrder}>Jag har beställt</GoldButton>
    } else if (showing.status === "ordered") {
      return <GoldButton onClick={this.doDone}>Slutför och arkivera besöket</GoldButton>
    } else {
      return <div></div>
    }
  },

  render() {
    const { showing, currentUser } = this.props;

    if (!showing) {
      return null;
    }
    const sortedTimeSlots = _.orderBy(showing.time_slots, "start_time");

    return (
      <div className={styles.container}>
        <ShowingHeader showing={showing} />
        {showing.selected_time_slot && this.renderSummary(showing)}
        {showing.status === "confirmed" && this.renderAttendeeList(showing, currentUser) }

        <div className={styles.timePicker}>
          {showing.status !== "confirmed" && sortedTimeSlots &&
                this.renderSlotPicker(sortedTimeSlots, currentUser)
          }

          { this.renderResult(showing, sortedTimeSlots, currentUser) }
        </div>

        <h3>Om filmen</h3>
        <MovieInfo movie={showing.movie} />

        { showing.owner.id === currentUser.id &&
          this.renderActionButton(showing)
        }
      </div>
    )
  }
});

export default withRouter(connect((state, props) => ({
    currentUser: getUser(state),
    showing: state.showings.showingMap[props.params.id]
}))(Showing))
