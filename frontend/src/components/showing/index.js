import React from 'react';
import loader from '../loader/';
import moment from 'moment';
import { withRouter } from 'react-router';
import { DateRange } from 'react-date-range';
import { fetchEndpoint, postEndpoint } from '../../service/backend';
import { VictoryChart, VictoryBar, VictoryAxis} from "victory";

import StatusLabel from '../status-label';
import SlotPicker from '../slot-picker';

import styles from './style.css'

const Showing = React.createClass({
  getInitialState() {
    return {
      loading: false,
      votingStats: []
  }
  },

  componentDidMount() {
    setTimeout(() => {
      const {showing} = this.props.showing;
      this.setState({
        votingStats:
          showing.time_slots.map((ts) => ({
            x: moment(ts.start_time).format('LLLL'),
            y: ts.users.length,
            id: ts.id
        }))
      });
    }, 1000)
  },

  submitSlotsPicked(selectedIds) {
    postEndpoint(`/showings/${this.props.params.id}/time_slots/votes`, {
      sf_slot_ids: selectedIds
    })
  },

  renderBarchart(time_slots) {
    const maxValue = _.maxBy(time_slots, 'users.length')
    return (
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
            <VictoryAxis domain={[0,10]}
                         tickFormat={(x) => parseInt(x,10)} />
            <VictoryAxis dependentAxis/>
            <VictoryBar horizontal
                        height={600}
                        style={{
                            data: {
                              width: 50,
                              margin: 0,
                              padding: 0
                            }
                          }}
                        animate={{
                            duration: 700,
                            onEnter: {
                              duration: 1000,
                              before: () => ({y: 0, fill: 'tomato'}),
                              after: (data) => ({fill: data.y === maxValue.users.length? 'goldenrod' : 'tomato'}),
                            },
                            onEnd: () => {console.log('THE END!')}
                          }}
                        data={this.state.votingStats} />
          </VictoryChart>
        </div>
    )
  },

  render() {
    const { showing } = this.props.showing;
    const { time_slots:selectedTimeSlots } = this.props.selectedTimeSlots;
    if (!showing || !selectedTimeSlots) {
      return null;
    }

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

          {this.renderBarchart(time_slots)}

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
