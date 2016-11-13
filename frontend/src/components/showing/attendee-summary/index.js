
import React, {PropTypes} from 'react';

const AttendeSummary = React.createClass({
  propTypes: {
    attendees: PropTypes.array.isRequired,
  },

  renderPaymentMethod(gift_card) {
    if(gift_card) {
      return <span> <span>{gift_card.card_type}</span> <span>{gift_card.number} </span> </span>
    } else {
      return <span> External payment method, swish etc </span>
    }
  },

  renderAttende(attendee) {
    return (<div key={attendee.id}>
      <span>{attendee.nick}</span>
      {this.renderPaymentMethod(attendee.gift_card)}
      </div>)
  },

  render() {
    console.log(this.props.attendees)
    return (<div>
      <h3>Summary</h3>
      {this.props.attendees.map(this.renderAttende)}
      </div>)
  }

});

export default AttendeSummary;
