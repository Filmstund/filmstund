import React, { Component } from "react";
import styled from "styled-components";

import qrcodegen from "../../lib/qrcode";
const QRC = qrcodegen.QrCode;

class QRCode extends Component {
  render() {
    const { value, width, height } = this.props;
    const encodedValue = QRC.encodeText(value, QRC.Ecc.MEDIUM);
    const SwishDiv = styled.div`
      width: ${width};
      height: ${height};
    `;

    return (
      <SwishDiv dangerouslySetInnerHTML={{ __html: encodedValue.toSvgString(5) }} />
    );
  }
}

export default QRCode;
