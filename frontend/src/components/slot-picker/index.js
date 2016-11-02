import React, { PropTypes } from 'react';
import _ from 'lodash';
import moment from '../../lib/moment';

import TimeSlotLabel from '../time-slot-label';

import styles from './style.css';

const SlotPicker = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    getId: PropTypes.func.isRequired,
    timeSlots: PropTypes.array.isRequired,
    selectedTimeSlotIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired
  },

  getDefaultProps() {
    return {
      showUsers: false
    }
  },

  handleSelectId(slotId) {
    const { onChange, selectedTimeSlotIds } = this.props;

    let updatedSlotIds = [];
    if (selectedTimeSlotIds.includes(slotId)) {
      updatedSlotIds = selectedTimeSlotIds.filter(id => id !== slotId)
    } else {
      updatedSlotIds = [...selectedTimeSlotIds, slotId]
    }

    onChange && onChange(updatedSlotIds);
  },
  renderSlot(slot) {
    const { showUsers, getId, selectedTimeSlotIds } = this.props;
    const slotId = getId(slot);
    const isSelected = selectedTimeSlotIds.includes(slotId);
    const total = slot.users.length;

    return (
      <div key={slotId}
           className={styles.doodleSlot + ' ' + (isSelected ? styles.selected : '')}
           onClick={() => this.handleSelectId(slotId)}>
        <div className={styles.time}>
          {moment(slot.start_time).format('LT')}
        </div>
        <div className={styles.tags}>
          {slot.is_vip && <TimeSlotLabel type="vip" />}
          {slot.is_3d && <TimeSlotLabel type="3d" />}
          {!slotId && <TimeSlotLabel type="maybe" />}
        </div>
        <small title={slot.auditorium_name}>
          {slot.theatre.replace('Fs ', '').substring(0, 4)}…
        </small>
        {(showUsers && total > 0) &&
          <div className={styles.users}>
            <i className="fa fa-users"/> {total}
          </div>
        }
      </div>
    )
  },
  renderDay(date, slots) {

    return (
      <div key={date} className={styles.doodleDay}>
        <div className={styles.doodleDate} title={date}>{moment(date).format('D MMM')}</div>
        <div>{_.orderBy(slots, 'start_time').map(this.renderSlot)}</div>
      </div>
    )
  },
  render() {
    const { timeSlots } = this.props;
    const slotsByDate = _.groupBy(timeSlots, s => moment(s.start_time).format('L'));
    const keys = _.orderBy(Object.keys(slotsByDate));

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
