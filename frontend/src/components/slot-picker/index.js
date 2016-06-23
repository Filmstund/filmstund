import React from 'react';
import _ from 'lodash';
import moment from '../../lib/moment';

import styles from './style.css';

let data = {"time_slots":[{"id":6,"price":120,"start_time":"2016-06-23T11:40:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 5","auditorium_id":45,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-23_1140_45_GB","created_at":"2016-06-23T20:10:43.632+02:00","updated_at":"2016-06-23T20:11:07.839+02:00"},{"id":7,"price":120,"start_time":"2016-06-23T14:15:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-23_1415_47_GB","created_at":"2016-06-23T20:10:43.647+02:00","updated_at":"2016-06-23T20:11:08.056+02:00"},{"id":8,"price":120,"start_time":"2016-06-23T16:50:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":true,"is_3d":false,"sf_slot_id":"2016-06-23_1650_47_GB","created_at":"2016-06-23T20:10:43.656+02:00","updated_at":"2016-06-23T20:11:08.174+02:00"},{"id":9,"price":135,"start_time":"2016-06-23T17:45:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":true,"is_3d":true,"sf_slot_id": "sdjhasjk","created_at":"2016-06-23T20:10:43.665+02:00","updated_at":"2016-06-23T20:11:08.349+02:00"},{"id":10,"price":135,"start_time":"2016-06-23T20:30:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-23_2030_61_GB","created_at":"2016-06-23T20:10:43.674+02:00","updated_at":"2016-06-23T20:11:08.463+02:00"},{"id":11,"price":135,"start_time":"2016-06-23T21:10:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 11","auditorium_id":51,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-23_2110_51_GB","created_at":"2016-06-23T20:10:43.683+02:00","updated_at":"2016-06-23T20:11:08.650+02:00"},{"id":12,"price":120,"start_time":"2016-06-25T15:40:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-25_1540_47_GB","created_at":"2016-06-23T20:10:43.692+02:00","updated_at":"2016-06-23T20:11:08.882+02:00"},{"id":13,"price":120,"start_time":"2016-06-25T18:10:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":null,"created_at":"2016-06-23T20:10:43.700+02:00","updated_at":"2016-06-23T20:11:09.070+02:00"},{"id":14,"price":135,"start_time":"2016-06-25T17:45:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-25_1745_61_GB","created_at":"2016-06-23T20:10:43.709+02:00","updated_at":"2016-06-23T20:11:09.823+02:00"},{"id":15,"price":135,"start_time":"2016-06-25T20:20:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-25_2020_61_GB","created_at":"2016-06-23T20:10:43.716+02:00","updated_at":"2016-06-23T20:11:10.137+02:00"},{"id":16,"price":135,"start_time":"2016-06-25T22:20:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 11","auditorium_id":51,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-25_2220_51_GB","created_at":"2016-06-23T20:10:43.723+02:00","updated_at":"2016-06-23T20:11:10.326+02:00"},{"id":17,"price":120,"start_time":"2016-06-26T15:40:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-26_1540_47_GB","created_at":"2016-06-23T20:10:43.730+02:00","updated_at":"2016-06-23T20:11:10.512+02:00"},{"id":18,"price":120,"start_time":"2016-06-26T18:10:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-26_1810_47_GB","created_at":"2016-06-23T20:10:43.737+02:00","updated_at":"2016-06-23T20:11:10.710+02:00"},{"id":19,"price":135,"start_time":"2016-06-26T18:15:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-26_1815_61_GB","created_at":"2016-06-23T20:10:43.743+02:00","updated_at":"2016-06-23T20:11:10.932+02:00"},{"id":20,"price":135,"start_time":"2016-06-26T19:30:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 11","auditorium_id":51,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-26_1930_51_GB","created_at":"2016-06-23T20:10:43.751+02:00","updated_at":"2016-06-23T20:11:11.117+02:00"},{"id":21,"price":135,"start_time":"2016-06-26T20:55:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-26_2055_61_GB","created_at":"2016-06-23T20:10:43.758+02:00","updated_at":"2016-06-23T20:11:11.301+02:00"},{"id":22,"price":120,"start_time":"2016-06-27T15:40:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-27_1540_47_GB","created_at":"2016-06-23T20:10:43.765+02:00","updated_at":"2016-06-23T20:11:11.597+02:00"},{"id":23,"price":120,"start_time":"2016-06-27T18:10:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-27_1810_47_GB","created_at":"2016-06-23T20:10:43.772+02:00","updated_at":"2016-06-23T20:11:11.779+02:00"},{"id":24,"price":135,"start_time":"2016-06-27T18:15:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-27_1815_61_GB","created_at":"2016-06-23T20:10:43.779+02:00","updated_at":"2016-06-23T20:11:12.015+02:00"},{"id":25,"price":135,"start_time":"2016-06-27T19:30:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 11","auditorium_id":51,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-27_1930_51_GB","created_at":"2016-06-23T20:10:43.786+02:00","updated_at":"2016-06-23T20:11:12.225+02:00"},{"id":26,"price":135,"start_time":"2016-06-27T20:55:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-27_2055_61_GB","created_at":"2016-06-23T20:10:43.792+02:00","updated_at":"2016-06-23T20:11:12.412+02:00"},{"id":27,"price":120,"start_time":"2016-06-28T15:40:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-28_1540_47_GB","created_at":"2016-06-23T20:10:43.799+02:00","updated_at":"2016-06-23T20:11:12.589+02:00"},{"id":28,"price":120,"start_time":"2016-06-28T18:10:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-28_1810_47_GB","created_at":"2016-06-23T20:10:43.806+02:00","updated_at":"2016-06-23T20:11:12.785+02:00"},{"id":29,"price":135,"start_time":"2016-06-28T18:15:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-28_1815_61_GB","created_at":"2016-06-23T20:10:43.813+02:00","updated_at":"2016-06-23T20:11:13.060+02:00"},{"id":30,"price":135,"start_time":"2016-06-28T19:30:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 11","auditorium_id":51,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-28_1930_51_GB","created_at":"2016-06-23T20:10:43.821+02:00","updated_at":"2016-06-23T20:11:13.374+02:00"},{"id":31,"price":135,"start_time":"2016-06-28T20:55:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-28_2055_61_GB","created_at":"2016-06-23T20:10:43.829+02:00","updated_at":"2016-06-23T20:11:13.573+02:00"},{"id":32,"price":120,"start_time":"2016-06-29T14:45:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-29_1445_47_GB","created_at":"2016-06-23T20:10:43.837+02:00","updated_at":"2016-06-23T20:11:13.778+02:00"},{"id":33,"price":120,"start_time":"2016-06-29T19:00:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 12","auditorium_id":52,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":"2016-06-29_1900_52_GB","created_at":"2016-06-23T20:10:43.844+02:00","updated_at":"2016-06-23T20:11:14.023+02:00"},{"id":34,"price":135,"start_time":"2016-06-29T17:45:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":"2016-06-29_1745_61_GB","created_at":"2016-06-23T20:10:43.852+02:00","updated_at":"2016-06-23T20:11:14.314+02:00"},{"id":35,"price":120,"start_time":"2016-06-30T14:45:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 7","auditorium_id":47,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":null,"created_at":"2016-06-23T20:10:43.861+02:00","updated_at":"2016-06-23T20:11:14.512+02:00"},{"id":36,"price":120,"start_time":"2016-06-30T19:00:00.000+02:00","showing_id":4,"auditorium_name":"Bergakungen sal 12","auditorium_id":52,"theatre":"Fs Bergakungen","theatre_account":2008,"is_vip":false,"is_3d":false,"sf_slot_id":null,"created_at":"2016-06-23T20:10:43.869+02:00","updated_at":"2016-06-23T20:11:14.731+02:00"},{"id":37,"price":135,"start_time":"2016-06-30T17:45:00.000+02:00","showing_id":4,"auditorium_name":"Biopalatset salong 1","auditorium_id":61,"theatre":"Biopalatset","theatre_account":2009,"is_vip":false,"is_3d":true,"sf_slot_id":null,"created_at":"2016-06-23T20:10:43.876+02:00","updated_at":"2016-06-23T20:11:14.934+02:00"}]}
let timeSlots = data.time_slots;

let slotsByDate = _.groupBy(timeSlots, s => new Date(s.start_time).toDateString());

const SlotPicker = React.createClass({
  getInitialState() {
    return {
      selectedIds: []
    }
  },
  handleSelectId(slotId) {
    console.log("slotId", slotId, this.state.selectedIds.includes(slotId));
    if (this.state.selectedIds.includes(slotId)) {
      this.setState({
        selectedIds: this.state.selectedIds.filter(id => id !== slotId)
      })
    } else {
      this.setState({
        selectedIds: [...this.state.selectedIds, slotId]
      })
    }
  },
  renderSlot(slot) {
    const isSelected = this.state.selectedIds.includes(slot.id)

    return (
      <div key={slot.id}
           className={styles.doodleSlot + ' ' + (isSelected ? styles.selected : '')}
           onClick={() => this.handleSelectId(slot.id)}>
        <div className={styles.time}>
          {moment(slot.start_time).format('LT')}
        </div>
        <div className={styles.tags}>
          {slot.is_vip && <span className={styles.is_vip}>VIP</span>}
          {slot.is_3d && <span className={styles.is_3d} title="Filmen visas i 3D :(">3D</span>}
          {!slot.sf_slot_id && <span className={styles.is_3d} title="Approximativ tid (kan komma att ändras)">≈</span>}
        </div>
        <small title={slot.auditorium_name}>
          {slot.theatre.replace('Fs ', '').substring(0, 4)}…
        </small>
      </div>
    )
  },
  renderDay(date, slots) {
    return (
      <div key={date} className={styles.doodleDay}>
        <div className={styles.doodleDate} title={moment(date).format('L')}>{moment(date).format('D MMM')}</div>
        <div>{slots.map(this.renderSlot)}</div>
      </div>
    )
  },
  render() {
    const keys = Object.keys(slotsByDate)
    return (
      <div className={styles.daysContainer}>
        <div className={styles.daysRow}>
          {keys.map(key => this.renderDay(key, slotsByDate[key]))}
        </div>
      </div>
    )
  }
})

export default SlotPicker
