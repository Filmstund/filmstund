import React from "react";
import { render } from "react-testing-library";
import QRCode from "./QRCode";

import QRC from "../../../lib/qrcode";

describe("QRCode", () => {
  describe("when provided with a value", () => {
    it("should match the snapshot", () => {
      const { container } = render(
        <QRCode width={100} height={100} value="this is a value" />
      );

      expect(container).toMatchSnapshot();
    });

    it("should memoize the value between renders", () => {
      const encodeTextMock = jest.spyOn(QRC, "encodeText");
      const { rerender } = render(
        <QRCode width={100} height={100} value="this is a value" />
      );

      expect(encodeTextMock).toHaveBeenCalled();

      rerender(<QRCode width={100} height={100} value="this is a value" />);

      expect(encodeTextMock).toHaveBeenCalledTimes(1);

      rerender(
        <QRCode width={100} height={100} value="this is another value" />
      );

      expect(encodeTextMock).toHaveBeenCalledTimes(2);
    });
  });
});
