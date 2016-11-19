import React from 'react';

import styles from './style.css';

const labels = {
  cancelled: {
    text: 'Inställd',
    color: '#bbb',
    textColor: 'black'
  },
  open: {
    text: 'Doodlas',
    color: '#ffd800',
    textColor: 'black'
  },
  confirmed: {
    text: 'Spikad',
    color: '#712',
    textColor: 'white'
  },
  ordered: {
    text: 'Stängd',
    color: '#bbb',
    textColor: 'black'
  },
  done: {
    text: 'Arkiverad',
    color: '#bbb',
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
