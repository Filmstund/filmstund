import React, {PropTypes} from 'react';
import UserAvatar from '../../user-avatar';
import styles from './style.css'

const AttendeSummary = React.createClass({
  propTypes: {
    attendees: PropTypes.array.isRequired,
  },

  renderAttende(attendee) {
    return (
      <div key={attendee.id} className={styles.tableRow}>
        <div className={styles.tableCell}>
          <div className={styles.flexRow}>
            <UserAvatar user={attendee} size={40} />
            <div className={styles.name}>{attendee.nick}</div>
          </div>
        </div>
        <div className={styles.tableCell}>
          {attendee.bioklubbsnummer}
        </div>
        <div className={styles.tableCell}>
          {attendee.gift_card && attendee.gift_card.card_type}
        </div>
        <div className={styles.tableCell}>
          {attendee.gift_card && attendee.gift_card.number}
        </div>
      </div>)
  },

  render() {
    return (
      <div>
        <h3>Anmälda</h3>
        <div className={styles.table}>
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>
              Namn
            </div>
            <div className={styles.tableCell}>
              Bioklubbsnummer
            </div>
            <div className={styles.tableCell}>
              Specialbetalning
            </div>
            <div className={styles.tableCell}>
              Nummer
            </div>
          </div>
          {this.props.attendees.map(this.renderAttende)}
        </div>
      </div>)
  }

});

export default AttendeSummary;
