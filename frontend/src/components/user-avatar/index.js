//@flow

import React, {PropTypes} from 'react';
import Avatar from 'react-avatar';
import styles from './style.css';

const UserAvatar = React.createClass({

  render() {
    const { user, size } = this.props;

    return (
      <div key={user.id}>
        <div className={styles.item} title={user.nick}>
          <Avatar name={user.nick} size={size} />
        </div>
      </div>
    )
  }
});

export default UserAvatar
