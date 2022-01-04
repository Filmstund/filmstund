import { addYears } from "date-fns";
import { GiftCertificate_Status } from "../../../../__generated__/types";
import { formatYMD } from "../../../../lib/dateTools";
import { createPaymentOptions } from "../createPaymentOptions";

describe("createPaymentOptions", () => {
  describe("default", () => {
    it("should include one option by default", () => {
      expect(createPaymentOptions([])).toHaveLength(1);
    });

    it("should map each option to an additional extra alternative", () => {
      const today = new Date();
      const expires = formatYMD(addYears(today, 1));

      expect(
        createPaymentOptions([
          {
            expireTime: expires,
            number: "123456",
            status: GiftCertificate_Status.Available,
          },
        ])
      ).toHaveLength(2);
    });
  });
});
