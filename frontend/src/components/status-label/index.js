import React from 'react';

import styles from './style.css';

const colors = {
  '0':  '#712',
  '1':  '#ffd800',
  '2':  'green',
  '3':  'gray'
}

const text = {
  'cancelled': 'cancelled',
  'open': 'open',
  'confirmed': 'confirmed',
  'done': 'done'
}

const StatusLable = React.createClass({
  render() {
    const { status } = this.props;

    return (
      <div className={styles.label} style={{backgroundColor: colors[status]}}>
        {text[status]}
      </div>
    )
  }
})


export default StatusLable
