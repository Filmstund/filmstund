//@flow

import React, {PropTypes} from 'react';
import Avatar from 'react-avatar';
import style from './style.css';

const UserList = React.createClass({
  propTypes: {
    users: PropTypes.array.isRequired
  },

  renderUserItem(user) {
    return (
      <div key={user.id}>
        <div className={style.item} title={user.nick}>
          <Avatar name={user.nick} size="40" />
        </div>
      </div>
    )
  },

  render() {
    const { users } = this.props;

    return (
      <div className={style.container}>
        {users.map(this.renderUserItem)}
      </div>
    )
  }
});

export default UserList
