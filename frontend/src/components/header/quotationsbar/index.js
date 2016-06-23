import React from 'react';
import styles from './style.css';
import loader from '../../loader'

const Quotationsbar = React.createClass({
  render() {
    const { bioord, loading } = this.props;

    let ord = bioord.bioord || {}

    if (loading && !ord) {
      ord = {
        phrase: 'Hittar inget bioord :(',
        number: 'Bapedibopi'
      }
    }
    return (
      <blockquote>
        <p>{ord.phrase}</p>
        <footer>
          <cite>De bio budorden : {ord.number}</cite>
        </footer>
      </blockquote>
    );
  }
});

export default loader((props) => ({
  bioord: '/random_bioord'
}))(Quotationsbar)
