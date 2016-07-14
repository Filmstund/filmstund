import React from 'react';
import loader from '../loader/';
import moment from 'moment';
import { withRouter } from 'react-router';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';
import { VictoryChart, VictoryBar} from "victory";

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';

import styles from './style.css'

const Showing = React.createClass({
  getInitialState() {
    return {
      loading: false,
      votingStats: [{
        x: '2015-07-15',
        y: 0
      }, {
        x: '2015-07-16',
        y: 0
      }, {
        x: '2015-07-17',
        y: 0
      }, {
        x: '2015-07-21',
        y: 0
      }]
  }
  },

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        votingStats: [{
          x: '2015-07-15',
          y: 2
        }, {
          x: '2015-07-16',
          y: 6
        }, {
          x: '2015-07-17',
          y: 8
        }, {
          x: '2015-07-21',
          y: 3
        }]
      });
    }, 1000)
  },

  submitSlotsPicked(selectedIds) {
    postEndpoint(`/showings/${this.props.params.id}/time_slots/votes`, {
      sf_slot_ids: selectedIds
    })
  },

  render() {
    const { showing } = this.props.showing;
    const { time_slots:selectedTimeSlots } = this.props.selectedTimeSlots;
    if (!showing || !selectedTimeSlots) {
      return null;
    }

/*
    let votingStats = showing.time_slots.map((ts) => ({
      x: moment(ts.start_time).format('L'),
      y: ts.users.length
    }));
*/
    const { loading, time_slots, status } = showing;

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

          { showing.is_admin && (
            <div style={{
              width: 500,
            }}>
            <VictoryChart width={600}
                          domainPadding={{x: 30, y:30}}
                          padding={{
                            top: 75,
                            bottom: 40,
                            left: 80,
                            right: 40
                          }}

            >

            <VictoryBar horizontal
                        height={600}
                        style={{
                          data: {
                            width: 50,
                            margin: 0,
                            padding: 0
                          }
                        }}
                        colorScale="qualitative"
                        animate={{
                          duration: 5000,
                          delay: 2000,
                          onEnter: {
                            duration: 1000,
                            before: () => ({opacity: 0.0}),
                            after: () => ({opacity: 1})
                          },
                          onEnd: () => {console.log('THE END!')}
                        }}
                        data={this.state.votingStats} />
            </VictoryChart>
            </div>
          )}

        </div>
      </div>
    )
  }
});

export default withRouter(loader((props) => ({
    showing: `/showings/${props.params.id}`,
    selectedTimeSlots: `/showings/${props.params.id}/time_slots/votes`
}
))(Showing))
