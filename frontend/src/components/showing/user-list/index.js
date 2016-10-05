//@flow

import React, {PropTypes} from 'react';
import style from './style.css';

const UserList = React.createClass({
  propTypes: {
    currentUser: PropTypes.object.isRequired,
    attendees: PropTypes.object.isRequired,
    doAttendShowing: PropTypes.func.isRequired,
    unAttendShowing: PropTypes.func.isRequired
  },

  renderAttendButton() {
    const { attendees, doAttendShowing, unAttendShowing} = this.props;
    const isAttending = attendees.find(attendee => attendee.user_id == this.props.currentUser.id);

    return (
        <label>
          <input type="checkbox" onClick={isAttending ? unAttendShowing : doAttendShowing} checked={Boolean(isAttending)} /> Jag kommer
        </label>
    )
  },

  renderUserItem(user) {
    return (
      <div key={user.id} className={style.item}>
        {user.nick}
      </div>
    )
  },

  render() {
    const { attendees } = this.props;
    return (
      <div>
        <h3>Deltagare</h3>
        {this.renderAttendButton()}
        <div className={style.container}>
          {attendees.map(this.renderUserItem)}
        </div>
      </div>
    )
  }
});

export default UserList