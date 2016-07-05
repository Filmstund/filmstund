import React from 'react';
import loader from '../loader/';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import { fetchEndpoint } from '../../service/backend';

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

const Showing = React.createClass({
  getInitialState() {
    return {
      timeRange: {
        startDate: moment(),
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

    fetchEndpoint(`/showings/${this.props.params.id}/between/${start}/${end}`)
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

  render() {
    const { loading, timeSlots } = this.state;
    const { showing } = this.props.showing;

    if (!showing) {
      return null;
    }
    const { startDate, endDate } = this.state.timeRange;

    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${showing.movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{showing.movie.title}</h3>
          <StatusLabel className={styles.label} status={showing.status} />
          {loading && <img src="/loader.gif" />}
          {!loading && !timeSlots && (
            <div>
              <DateRange
                minDate={startDate}
                startDate={startDate}
                endDate={endDate}
                linkedCalendars={true}
                onInit={this.handleChange}
                onChange={(time) => this.setState({timeRange: time})} />
              <button onClick={this.getTimeSlots}>Hämta tider</button>
            </div>
          )}
          {timeSlots && <SlotPicker timeSlots={timeSlots} />}
        </div>
      </div>
    )
  }
})

export default loader((props) => ({
    showing: `/showings/${props.params.id}`
}
))(Showing)
