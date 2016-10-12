import React, { PropTypes } from 'react';

import styles from './style.css';

const TimeSlotLabel = React.createClass({
  propTypes: {
    type: PropTypes.oneOf(["vip", "3d", "maybe"]).isRequired
  },

  render() {
    let {type} = this.props;

    switch (type) {
      case "vip":
        return (
          <span className={styles.is_vip}>VIP</span>
        )
      case "3d":
        return (
          <span className={styles.is_3d} title="Filmen visas i 3D :(">3D</span>
        )
      case "maybe":
        return (
          <span className={styles.is_maybe} title="Approximativ tid (kan komma att ändras)">≈</span>
        )
      default:
    }
  }
})

export default TimeSlotLabel
