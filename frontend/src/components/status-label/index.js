import React from 'react';

import styles from './style.css';

const labels = {
  cancelled: {
    text: 'cancelled',
    color: '#712',
    textColor: 'black'
  },
  open: {
    text: 'open',
    color: '#ffd800',
    textColor: 'black'
  },
  confirmed: {
    text: 'confirmed',
    color: 'green',
    textColor: 'white'
  },
  ordered: {
    text: 'ordered',
    color: 'goldenrod',
    textColor: 'black'
  },
  done: {
    text: 'done',
    color: 'gray',
    textColor: 'black'
  }
}

const StatusLable = React.createClass({
  render() {
    const { status } = this.props;
    const labelData = labels[status];

    return (
      <div className={styles.label} style={{backgroundColor: labelData.color, color: labelData.textColor}}>
        {labelData.text}
      </div>
    )
  }
})


export default StatusLable
