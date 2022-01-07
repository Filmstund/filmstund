import { GiftCertificate_Status } from "../../../../__generated__/types";
import { createPaymentOptions } from "../createPaymentOptions";
import { Temporal } from "@js-temporal/polyfill";

describe("createPaymentOptions", () => {
  describe("default", () => {
    it("should include one option by default", () => {
      expect(createPaymentOptions([])).toHaveLength(1);
    });

    it("should map each option to an additional extra alternative", () => {
      const today = Temporal.Now.plainDateISO().add({ years: 1 });

      expect(
        createPaymentOptions([
          {
            expireTime: today,
            number: "123456",
            status: GiftCertificate_Status.Available,
          },
        ])
      ).toHaveLength(2);
    });
  });
});
