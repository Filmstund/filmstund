import React from 'react';
import styles from './style.css';
import loader from '../../loader'

const Quotationsbar = React.createClass({
  render() {
    let { bioord, loading } = this.props;

    if (loading && !bioord) {
      bioord = {
        p: 'Hittar inget bioord :(',
        cite: 'Bapedibopi'
      }
    }
    return (
      <blockquote>
        <p>{bioord.phrase}</p>
        <footer>
          <cite>De bio budorden : {bioord.number}</cite>
        </footer>
      </blockquote>
    );
  }
});

export default loader((props) => ({
  bioord: 'random_bioord'
}))(Quotationsbar)
