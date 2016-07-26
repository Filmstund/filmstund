import React from 'react';
import loader from '../loader/';
import { withRouter } from 'react-router';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';


import styles from './style.css'

const stateDefinitions = {
  available: {
    color: null,
    label: 'Available',
  },
  enquire: {
    color: '#ffd200',
    label: 'Enquire',
  },
  unavailable: {
    selectable: false,
    color: '#78818b',
    label: 'Unavailable',
  },
};

const minDate = moment();

const CreateShowing = React.createClass({
  getInitialState() {
    return {
      timeRange: {
        startDate: minDate,
        endDate: moment().add(3, 'weeks'),
      },
      loading: false
    }
  },

  getTimeSlots() {
    const format = 'YYYY-MM-DD hh:mm:ssZZ';

    const start = this.state.timeRange.startDate.format(format);
    const end = this.state.timeRange.endDate.format(format);

    this.setState({
      loading: true
    });

    fetchEndpoint(`/movies/${this.props.params.sf_id}/between/${start}/${end}`)
      .then((resp) => {
        this.setState({
          timeSlots: resp.time_slots,
          loading: false
        });
      }).catch(err => {
        console.error(err);
        this.setState({
          loading: false
        });
      })
  },

  submitSlotsPicked(selectedSlotIds) {
      postEndpoint('/showings', {
          showing: {
            sf_id: this.props.params.sf_id
          },
          sf_slot_ids: selectedSlotIds
      }).then((resp) => {
          this.props.router.push(`/showings/${resp.showing.id}`);
      });
  },

  render() {
    const { loading, timeSlots } = this.state;
    const { movie } = this.props.movie;

    if (!movie) {
      return null;
    }
    const { startDate, endDate } = this.state.timeRange;

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{movie.title}</h3>
          {loading && <img src="/loader.gif" />}
          {!loading && !timeSlots && (
            <div>
              <DateRange
                minDate={minDate}
                startDate={startDate}
                endDate={endDate}
                linkedCalendars={true}
                onInit={this.handleChange}
                onChange={(time) => this.setState({timeRange: time})} />
              <button onClick={this.getTimeSlots}>Hämta tider</button>
            </div>
          )}
          { timeSlots && (
              <div>
                  <SlotPicker timeSlots={timeSlots}
                              onSubmit={this.submitSlotsPicked}/>
              </div>
          )}
        </div>
      </div>
    )
  }
})

export default withRouter(loader((props) => ({
    movie: `/movies/${props.params.sf_id}`
}
))(CreateShowing))
