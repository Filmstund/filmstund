import React, { useMemo } from "react";

import QRC from "../../../lib/qrcode";

interface Props {
  value: string;
  width: number;
  height: number;
}
const QRCode: React.VFC<Props> = ({ value, width, height }) => {
  const svgString = useMemo(() => {
    // @ts-ignore
    return QRC.encodeText(value, QRC.Ecc.MEDIUM).toSvgString(5);
  }, [value]);

  return (
    <div
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

export default QRCode;
