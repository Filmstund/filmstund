import React, {Component} from "react";
import bwipjs from 'bwip-js';

class AztecCode extends Component {
  componentDidMount() {
    const { text } = this.props;
    bwipjs('code', {
            bcid:    'azteccode',
            format:  'compact',
            text:    text,
            scale:   3,
        }, function (err, cvs) { });
  }
  render() {
    return (
      <div>
        <canvas id="code" />
      </div>
    );
  }
}

export default AztecCode;
