import React, { useMemo } from "react";

import QRC from "../../../lib/qrcode";

const QRCode = ({ value, width, height }) => {
  const svgString = useMemo(
    () => QRC.encodeText(value, QRC.Ecc.MEDIUM).toSvgString(5),
    [value]
  );

  return (
    <div
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

export default QRCode;
