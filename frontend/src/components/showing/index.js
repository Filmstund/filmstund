import React, { PropTypes } from 'react';
import loader from '../loader/';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { DateRange } from 'react-date-range';
import { postEndpoint } from '../../service/backend';
import { HorizontalBar } from 'react-chartjs-2';

import _ from 'lodash';

import ShowingHeader from '../showing-header';
import MovieInfo from '../movie-info';
import SlotPicker from '../slot-picker';
import UserList from './UserList';

import styles from './style.css'
import {getUser} from "../../store/reducer/index";

const f = (date, is3D, isVip) => {
  let formattedDate = moment(date).format("DD/M HH:mm")
  if (is3D) formattedDate = "3D " + formattedDate;
  if (isVip) formattedDate = "VIP " + formattedDate;
  return formattedDate
};

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

  renderChart(barData, selectedId) {

    const data = {
      labels: barData.map(d => d.x),
      datasets: [{
        label: 'Röster',
        backgroundColor: barData.map(d => d.id === selectedId ? 'goldenrod' : '#712'),
        hoverBackgroundColor: barData.map(d => d.id === selectedId ? '#f0d000' : '#934'),
        data: barData.map(d => d.y)
      }]
    };

    const options = {
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            stepSize: 1,
            suggestedMax: 10
          }
        }]
      },
      legend: {
        display: false
      }
    };

    return (
      <HorizontalBar data={data}
                     onElementsClick={this.onBarClicked}
                     width={800}
                     height={55 + barData.length*18.4}
                     options={options} />
    )
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
    const { loadingAttend } = this.state;
    const { showing: { showing } } = this.props;
    const isAttending = showing.attendees.find(attendee => attendee.user_id == this.props.currentUser.id);

    return (
      <label>
        <input type="checkbox" onClick={isAttending ? this.unAttendShowing : this.doAttendShowing} checked={Boolean(isAttending)} disabled={loadingAttend} /> Jag kommer
      </label>
    )
  },

  doAttendShowing() {
    this.setState({ loadingAttend: true });
    postEndpoint(`/showings/${this.props.params.id}/attend`)
      .then(this.updateAttendees);

  },

  unAttendShowing() {
    this.setState({ loadingAttend: true });
    postEndpoint(`/showings/${this.props.params.id}/unattend`)
      .then(this.updateAttendees);
  },

  updateAttendees({attendees}) {
    this.props.update('showing', Promise.resolve(() => ({
      showing: {
        ...this.props.showing.showing,
        attendees
      }
    })))
    this.setState({ loadingAttend: false })
  },

  submitTimeSlot(slot_id) {
    this.props.update('showing', postEndpoint(`/showings/${this.props.params.id}/complete`, { slot_id }))
  },

  renderUserList(votingUsers) {
    return (
      <UserList users={votingUsers} />
    )
  },

  render() {
    const { showing: { showing }, currentUser } = this.props;
    const { time_slots:selectedTimeSlots } = this.props.selectedTimeSlots;
    const votingUsers = _(showing.time_slots).flatMap('users').uniqBy('id').value();

    if (!showing || !selectedTimeSlots) {
      return null;
    }

    let { time_slots } = showing;
    if (this.state.timeSlots) {
      time_slots = this.state.timeSlots;
    }

    time_slots = _.orderBy(time_slots, "start_time");

    const timeslotHasUsers = ts => ts.users.length > 0;

    const barData = time_slots.filter(timeslotHasUsers).map((ts) => ({
      x: f(ts.start_time, ts.is_3d, ts.is_vip),
      y: ts.users.length,
      id: ts.id
    }));

    return (
      <div className={styles.container}>
        <ShowingHeader showing={showing} />
        <div className={styles.showingInfo}>
          Admin: {showing.owner.nick}
        </div>
        {showing.selected_time_slot && (
          <div>Bestämt besöksdatum är {f(showing.selected_time_slot.start_time, showing.selected_time_slot.is_3d, showing.selected_time_slot.is_vip)}</div>
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
	    {this.renderChart(barData, showing.selected_time_slot && showing.selected_time_slot.id)}
          </div>
          <h3>Deltagare</h3>
          {this.renderAttendButton()}
          {this.renderUserList(votingUsers)}
        </div>
        <h3>Om filmen</h3>
        <MovieInfo movie={showing.movie} />
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
