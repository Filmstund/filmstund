import React from 'react';
import styles from './style.css';

const Quotationsbar = React.createClass({
  componentDidMount() {
    fetch('/api/bioord.json').then(d => d.json()).then(console.log).catch(console.error)
  },
  render() {
    const bioord = this.props.bioord || [];
    let randomBioord = bioord[Math.floor(Math.random() * (bioord.length - 1))]
    if (!randomBioord) {
      randomBioord = {
        p: 'Hittar inget bioord :(',
        cite: 'Bapedibopi'
      }
    }
    return (
      <blockquote>
        <p>{randomBioord.p}</p>
        <footer>
          <cite>{randomBioord.cite}</cite>
        </footer>
      </blockquote>
    );
  }
});

export default Quotationsbar
