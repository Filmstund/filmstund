import React from 'react';
import styles from './style.css';

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
    fetch('/api/random_bioord.json')
    .then(d => d.json())
    .then(bioord => {
      this.setState({ bioord, loading: false })
    }).catch(err => {
      this.setState({ loading: false })
      console.error(err)
    })
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
