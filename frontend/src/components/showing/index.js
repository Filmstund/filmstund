import React from 'react';
import loader from '../loader/';

import styles from './style.css'

const Showing = React.createClass({
  render() {
    console.log('asd', this.props.showing);
    const { showing } = this.props.showing;
    return (
      <div>{showing && showing.movie.title}</div>
    )
  }
})


export default loader((props) => ({
  showing: `/showings/${props.params.id}`
}))(Showing)
