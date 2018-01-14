import React, {PureComponent} from "react";
import bwipjs from 'bwip-js';
import { uniqueId } from "lodash";

class AztecCode extends PureComponent {
  componentWillMount() {
    this.id = uniqueId('aztec-');
  }
  componentDidMount() {
    bwipjs(this.id, {
            bcid:    'azteccode',
            format:  'compact',
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

export default AztecCode;
