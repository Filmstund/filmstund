//@flow

import React, {PropTypes} from 'react';
import style from './style.css';

const UserList = React.createClass({
  propTypes: {
    users: PropTypes.array.isRequired
  },

  renderUserItem(user) {
    return (
      <div key={user.id} className={style.item}>
        {user.nick}
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