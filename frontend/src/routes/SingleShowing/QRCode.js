import React, {PureComponent} from "react";
import bwipjs from 'bwip-js';
import { uniqueId } from "lodash";

class QRCode extends PureComponent {
  componentWillMount() {
    this.id = uniqueId('qr-');
  }
  componentDidMount() {
    bwipjs(this.id, {
            bcid:    'qrcode',
            eclevel: 'L',
            text:    this.props.data,
            scale:   3,
        }, function (err, cvs) { });
  }
  render() {
    return (
      <div>
        <canvas id={this.id} />
      </div>
    );
  }
}

export default QRCode;
