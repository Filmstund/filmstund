import React from 'react';
import styles from './style.css';
import {extendObjectFromEndpoint} from '../../../lib/backend.js';

const Quotationsbar = React.createClass({
  getInitialState() {
    return {
      loading: false,
      bioord: {}
    }
  },
  componentWillMount() {
    this.setState({
      loading: true
    })

    extendObjectFromEndpoint(this.state.bioord, 'random_bioord')
      .then(res => this.setState({bioord: res}));
  },
  render() {
    let { loading, bioord } = this.state;

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

export default Quotationsbar
