import React, { PropTypes } from 'react';
import _ from 'lodash';
import moment from '../../lib/moment';

import styles from './style.css';

const SlotPicker = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    getId: PropTypes.func.isRequired,
    timeSlots: PropTypes.array.isRequired,
    userId: PropTypes.number
  },

  getDefaultProps() {
    return {
      initiallySelectedTimeSlots: [],
      showUsers: false,
      userId: -1
    }
  },

  getInitialState() {
    return {
      selectedIds: this.props.initiallySelectedTimeSlots.map(slot => this.props.getId(slot))
    }
  },

  handleSelectId(slotId) {
    let selectedIds = this.state.selectedIds;
    if (selectedIds.includes(slotId)) {
        selectedIds = selectedIds.filter(id => id !== slotId);
    } else {
        selectedIds = [...selectedIds, slotId];
    }
    this.setState({selectedIds}, () => this.props.onChange(selectedIds));
  },
  renderSlot(slot) {
    const { showUsers, userId, getId } = this.props;
    const slotId = getId(slot);
    const isSelected = this.state.selectedIds.includes(slotId);
    const slotPickedByCurrentUser = Boolean(slot.users.find(u => u.id === userId));
    const addOne = isSelected && !slotPickedByCurrentUser;
    const subtractOne = !isSelected && slotPickedByCurrentUser;
    const total = slot.users.length + addOne - subtractOne;

    return (
      <div key={slotId}
           className={styles.doodleSlot + ' ' + (isSelected ? styles.selected : '')}
           onClick={() => this.handleSelectId(slotId)}>
        <div className={styles.time}>
          {moment(slot.start_time).format('LT')}
        </div>
        <div className={styles.tags}>
          {slot.is_vip && <span className={styles.is_vip}>VIP</span>}
          {slot.is_3d && <span className={styles.is_3d} title="Filmen visas i 3D :(">3D</span>}
          {!slotId && <span className={styles.is_3d} title="Approximativ tid (kan komma att ändras)">≈</span>}
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
