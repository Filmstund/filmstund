import React, {Component} from "react";
import bwipjs from 'bwip-js';

class QRCode extends Component {
  componentDidMount() {
    const { data } = this.props;
    bwipjs('code', {
            bcid:    'qrcode',
            eclevel: 'L',
            text:    data,
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

export default QRCode;
