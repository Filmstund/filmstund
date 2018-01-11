import React, {Component} from "react";
import bwipjs from 'bwip-js';

class QRCode extends Component {
  componentDidMount() {
    const { data } = this.props;
    bwipjs('code', {
            bcid:    'qrcode',
            text:    data,
            scale:   3,
            eclevel: 'L',
        }, function (err, cvs) { });
  }
  render() {
    return (
      <canvas id="code" />
    );
  }
}

export default QRCode;
