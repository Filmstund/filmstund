import React, {PropTypes} from 'react';
import _ from 'lodash';
import moment from '../../lib/moment';

import styles from './style.css';

const SlotPicker = React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    timeSlots: PropTypes.array.isRequired
  },
  getInitialState() {
    return {
      selectedIds: []
    }
  },
  handleSelectId(slotId) {
    let selectedIds = this.state.selectedIds;
    if (selectedIds.includes(slotId)) {
        selectedIds = selectedIds.filter(id => id !== slotId);
    } else {
        selectedIds = [...selectedIds, slotId];
    }
    this.setState({selectedIds});
  },
  renderSlot(slot) {
    const isSelected = this.state.selectedIds.includes(slot.sf_slot_id)

    return (
      <div key={slot.sf_slot_id}
           className={styles.doodleSlot + ' ' + (isSelected ? styles.selected : '')}
           onClick={() => this.handleSelectId(slot.sf_slot_id)}>
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
        <div className={styles.doodleDate} title={date}>{moment(date).format('D MMM')}</div>
        <div>{slots.map(this.renderSlot)}</div>
      </div>
    )
  },
  render() {
    const { timeSlots, onSubmit } = this.props;
    const slotsByDate = _.groupBy(timeSlots, s => moment(s.start_time).format('L'));
    const keys = Object.keys(slotsByDate)

    return (
      <div>
        <div className={styles.daysContainer}>
          <div className={styles.daysRow}>
            {keys.map(key => this.renderDay(key, slotsByDate[key]))}
          </div>
        </div>
        <button onClick={() => onSubmit(this.state.selectedIds)}>Submit</button>
      </div>
    )
  }
})

export default SlotPicker
