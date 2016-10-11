import React from 'react';
import loader from '../loader/';
import { withRouter } from 'react-router';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';
import GoldButton from '../gold-button';
import LoadingIndicator from '../loading-indicator';

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
      loading: false,
      slotsPicked: []
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

  getTheme() {
    return {
      MonthButton    : {
        background   : '#712'
      },
      MonthArrowPrev : {
        borderRightColor : '#fff',
      },
      MonthArrowNext : {
        borderLeftColor : '#fff',
      },
      Weekday        : {
        background   : '#ddd',
        color        : '#333'
      },
      Day            : {
        transition   : 'transform .1s ease, box-shadow .1s ease, background .1s ease'
      },
      DaySelected    : {
        background   : '#712'
      },
      DayActive    : {
        background   : '#712',
        boxShadow    : 'none'
      },
      DayInRange     : {
        background   : '#712',
        color        : '#fff'
      },
      DayHover       : {
        background   : '#ffffff',
        color        : '#7f8c8d',
        transform    : 'scale(1.1) translateY(-10%)',
        boxShadow    : '0 2px 4px rgba(0, 0, 0, 0.4)'
      }
    };
  },

  updateSlotsPicked(selectedSlotIds) {
    this.setState({slotsPicked: selectedSlotIds});
  },

  submitSlotsPicked() {
    this.setState({loading: true});
    postEndpoint('/showings', {
      showing: {
        sf_id: this.props.params.sf_id
      },
      sf_slot_ids: this.state.slotsPicked
    })
    .then((resp) => {
      this.props.router.push(`/showings/${resp.showing.id}`);
    })
    .catch(n => console.error('Failed to create showing ', n))
    .then(() => this.setState({loading: false}));
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
        <h3>Skapa besök: {movie.title}</h3>
        {loading && <LoadingIndicator />}
        {!loading && !timeSlots && (
          <div>
            <DateRange
              minDate={minDate}
              startDate={startDate}
              endDate={endDate}
              linkedCalendars={true}
              onInit={this.handleChange}
              onChange={(time) => this.setState({timeRange: time})}
              theme={this.getTheme()} />
              <div className={styles.button}>
                <GoldButton onClick={this.getTimeSlots}>Hämta tider</GoldButton>
              </div>
          </div>
        )}
        { timeSlots && (
          <div>
            <div className={styles.slotPicker}>
                <SlotPicker timeSlots={timeSlots}
                            getId={(slot) => slot.sf_slot_id}
                            onChange={this.updateSlotsPicked}/>
            </div>
            <div className={styles.button}>
              <GoldButton onClick={this.submitSlotsPicked}>Skapa besök</GoldButton>
            </div>
          </div>
        )}
      </div>
    )
  }
})

export default withRouter(loader((props) => ({
    movie: `/movies/${props.params.sf_id}`
}
))(CreateShowing))
