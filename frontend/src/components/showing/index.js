import React from 'react';
import loader from '../loader/';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import 'style!css!react-daterange-picker/dist/css/react-calendar.css';
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
      }
    }
  },

  getTimeSlots() {
    console.log(this.state.timeRange);
    const format = 'YYYY-MM-DD hh:mm:ssZZ';
    let start = this.state.timeRange.startDate.format(format);
    let end = this.state.timeRange.endDate.format(format);
    console.log('timerange:', start, end);
    fetchEndpoint(`/showings/${this.props.params.id}/between/${start}/${end}`)
      .then((resp) => {
        this.setState({timeSlots: resp.time_slots});
      });
  },

  render() {
    const { showing } = this.props.showing;
    //console.log('showingstimeslots', time_slots);
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
          {!this.state.timeSlots && (
            <div>
              <DateRange
                startDate={startDate}
                endDate={endDate}
                linkedCalendars={ true }
                onInit={this.handleChange}
                onChange={(time) => this.setState({timeRange: time})} />
              <button onClick={this.getTimeSlots}>Hämta tider</button>
            </div>
          )}
          {this.state.timeSlots &&
            <SlotPicker timeSlots={this.state.timeSlots}/>
          }
        </div>
      </div>
    )
  }
})

export default loader((props) => ({
    showing: `/showings/${props.params.id}`
}
))(Showing)
