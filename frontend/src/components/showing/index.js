import React from 'react';
import loader from '../loader/';
import { withRouter } from 'react-router';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';

import ShowingHeader from '../showing-header';
import MovieInfo from '../movie-info';
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
      loading: false,
      slotsSaved: false
    }
  },

  submitSlotsPicked(selectedIds) {
    console.log('slots picked', selectedIds);
    postEndpoint(`/showings/${this.props.params.id}/time_slots/votes`, {
      sf_slot_ids: selectedIds
    }).then(() => {this.setState({slotsSaved: true})});
  },

  slotsChanged() {
    this.setState({slotsSaved: false});
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
        <ShowingHeader showing={showing} />
        <div className={styles.showingInfo}>
          Admin: {showing.owner.nick}
        </div>
        <div className={styles.timePicker}>
          { time_slots && (
              <div>
                <SlotPicker timeSlots={time_slots}
                            initiallySelectedTimeSlots={selectedTimeSlots}
                            onSubmit={this.submitSlotsPicked}
                            onChange={this.slotsChanged}
                            saved={this.state.slotsSaved}
                            showSaved={true}
                            showUsers={true} />
              </div>
          )}
        </div>
        <h3>Om filmen</h3>
        <MovieInfo movie={showing.movie} />
      </div>
    )
  }
})

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`,
    selectedTimeSlots: `/showings/${props.params.id}/time_slots/votes`
}
))(Showing))
