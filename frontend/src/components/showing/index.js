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
import PaymentSelector from './payment-selector';
import AttendeSummary from './attendee-summary';

import styles from './style.css'
import { getUser } from "../../store/reducer";
import {
    fetchShowing,
    fetchTimeSlotsForShowing,
    postAttendStatusChange,
    postShowingOrdered,
    postShowingDone,
    submitAddSlotPickedForShowing,
    submitRemoveSlotPickedForShowing,
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
    this.props.fetchShowing()
    this.props.fetchTimeSlotsForShowing()
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
                    onClick={() => this.props.submitTimeSlot(ts.id)} title="Välj"></div>
          })
        }
      </div>
    )
  },

  renderSummary(showing) {
    return (
      <div>
        {moment(showing.selected_time_slot.start_time).format("ddd D/M HH:mm")} på {showing.selected_time_slot.theatre}
        {showing.selected_time_slot.is_3d && (<TimeSlotLabel type="3d" />)}
        {showing.selected_time_slot.is_vip && (<TimeSlotLabel type="vip" />)}
      </div>
    )
  },

  renderAttendeeList(showing, currentUser) {
    return (
      <div className={styles.attendees}>
        <div className={styles.numberOfAttendees}>{showing.attendees.length} deltagare</div>
        <UserList attendees={showing.attendees}
                  currentUser={currentUser}
                  doAttendShowing={this.props.doAttendShowing}
                  unAttendShowing={this.props.unAttendShowing} />
      </div>
    )
  },

  renderSlotPicker(time_slots, user) {
    const selectedTimeSlotIds = time_slots.filter(ts => ts.users.map(u => u.id).includes(user.id)).map(ts => ts.id);

    return (
      <div className={styles.timePicker}>
        Markera de tider du kan. Du blir automagiskt anmäld om en av dina tider vinner omröstningen.
        <div className={styles.timePicker}>
          <SlotPicker timeSlots={time_slots}
                      onAddSlot={this.props.submitAddSlotPickedForShowing}
                      onRemoveSlot={this.props.submitRemoveSlotPickedForShowing}
                      getId={(slot) => slot.id}
                      selectedTimeSlotIds={selectedTimeSlotIds}
                      showUsers={true} />
        </div>
      </div>
    )
  },

  renderAdmin(showing, time_slots, currentUser) {
    return (
      <div className={styles.adminContainer}>
        <h3>Admin</h3>
        {showing.status === "open" && (
            <div title="(29 maj)">Välj ett datum, vilket som helst!</div>
        )}
        {showing.status === "confirmed" && (
            <div title="(29 maj)">Välj ett datum, vilket som helst! (OBS: om du byter datum nollställs deltagarlistan.)</div>
        )}
        <div className={styles.buttonAndGraphContainer}>
          {this.renderSubmitTimeSlotButtons(time_slots, showing.selected_time_slot)}
          <VotingChart timeSlots={time_slots} selectedId={showing.selected_time_slot && showing.selected_time_slot.id}/>
        </div>

        <div className={styles.attendeeSummary}>
          <AttendeSummary attendees={showing.attendees} />
        </div>

        {this.renderActionButton(showing)}
      </div>
    )
  },

  renderActionButton(showing) {
    switch (showing.status) {
      case "confirmed":
        return <GoldButton onClick={this.doOrder}>Stäng anmälan</GoldButton>
      case "ordered":
        return <GoldButton onClick={this.props.doDone}>Arkivera</GoldButton>
      default:
        return <div></div>
    }
  },

  render() {
    const { showing, currentUser, giftCards } = this.props;

    if (!showing) {
      return null;
    }
    const sortedTimeSlots = _.orderBy(showing.time_slots, "start_time");
    const attendee = (showing.attendees || []).find(a => a.user_id === currentUser.id);
    let paymentMethod;
    if (attendee && attendee.gift_card) {
      paymentMethod = attendee.gift_card.id;
    }
    console.log('whathahta');
    console.log('attendee:', attendee);
    console.log('showing.attendees', showing.attendees);
    console.log('paymentmethod', paymentMethod);

    return (
      <div className={styles.container}>
        <ShowingHeader showing={showing} />
        {showing.selected_time_slot && this.renderSummary(showing)}
        {showing.status === "confirmed" && this.renderAttendeeList(showing, currentUser) }
        <PaymentSelector giftCards={giftCards} showingId={this.props.params.id} currentPaymentMethod={paymentMethod} />

        {showing.status === "open" && sortedTimeSlots && this.renderSlotPicker(sortedTimeSlots, currentUser)}

        {showing.owner.id === currentUser.id && this.renderAdmin(showing, sortedTimeSlots, currentUser)}

        <h3>Om filmen</h3>
        <MovieInfo movie={showing.movie} />

      </div>
    )
  }
});

const mapStateToProps = (state, props) => ({
  currentUser: getUser(state),
  showing: state.showings.showingMap[props.params.id],
  giftCards: state.user.cards
})

const mapDispatchToProps = (dispatch, props) => ({
  submitTimeSlot: (slot_id) => dispatch(submitTimeSlotForShowing(props.params.id, slot_id)),
  doAttendShowing: () => dispatch(postAttendStatusChange(props.params.id, 'attend')),
  unAttendShowing: () => dispatch(postAttendStatusChange(props.params.id, 'unattend')),
  doOrder: () => dispatch(postShowingOrdered(props.params.id)),
  doDone: () => dispatch(postShowingDone(props.params.id)),
  submitAddSlotPickedForShowing: (add_id) => dispatch(submitAddSlotPickedForShowing(props.params.id, add_id)),
  submitRemoveSlotPickedForShowing: (remove_id) => dispatch(submitRemoveSlotPickedForShowing(props.params.id, remove_id)),
  fetchShowing: () => dispatch(fetchShowing(props.params.id)),
  fetchTimeSlotsForShowing: () => dispatch(fetchTimeSlotsForShowing(props.params.id)),
})

const connectedShowing = connect(mapStateToProps, mapDispatchToProps)(Showing)

export default withRouter(connectedShowing)
