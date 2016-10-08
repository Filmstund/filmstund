//@flow

import React, {PropTypes} from 'react';
import UserAvatar from '../../avatar';
import GoldButton from '../../gold-button';
import style from './style.css';

const UserList = React.createClass({
  propTypes: {
    currentUser: PropTypes.object.isRequired,
    attendees: PropTypes.array.isRequired,
    doAttendShowing: PropTypes.func.isRequired,
    unAttendShowing: PropTypes.func.isRequired
  },

  renderAttendButton() {
    const { attendees, doAttendShowing, unAttendShowing} = this.props;
    const isAttending = attendees.find(attendee => attendee.user_id == this.props.currentUser.id);

    return (
      <GoldButton onClick={isAttending ? unAttendShowing : doAttendShowing}>
        {isAttending ? "Jag kommer inte" : "Jag kommer"}
      </GoldButton>
    )
  },

  renderUserItem(user) {
    return (
      <div key={user.id}>
        <UserAvatar user={user} size={40} />
      </div>
    )
  },

  render() {
    const { attendees } = this.props;
    return (
      <div>
        <div className={style.container}>
          {attendees.map(this.renderUserItem)}
        </div>
        {this.renderAttendButton()}
      </div>
    )
  }
});

export default UserList
