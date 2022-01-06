import {
  GiftCertificate_Status,
  GiftCertificateFragment,
  PaymentOption,
  PaymentType,
} from "../../../__generated__/types";
import { Temporal } from "@js-temporal/polyfill";

export interface DisplayPaymentOption extends PaymentOption {
  displayName: string;
  type: PaymentType;
  ticketNumber: string | null;
  suffix?: string | null;
}

const createPaymentOption = (
  displayName: string,
  type: PaymentType,
  ticketNumber: string | null = null,
  suffix: string | null = null
): DisplayPaymentOption => {
  return { displayName, type, ticketNumber, suffix };
};

const createForetagsbiljetter = (
  foretagsbiljetter: GiftCertificateFragment[]
): DisplayPaymentOption[] => {
  const now = Temporal.Now.plainDateISO();

  return foretagsbiljetter
    .filter(
      ({ status, expireTime }) =>
        (status === GiftCertificate_Status.Available &&
          expireTime.equals(now)) ||
        Temporal.PlainDate.compare(expireTime, now) > 0
    )
    .map(({ number, expireTime }) =>
      createPaymentOption(
        "Företagsbiljett",
        PaymentType.GiftCertificate,
        number,
        expireTime.toString()
      )
    );
};

export const stringifyOption = (option: DisplayPaymentOption): string => {
  const { displayName } = option;
  if (option.ticketNumber) {
    return `${displayName}: ${option.ticketNumber} (${option.suffix})`;
  } else {
    return displayName;
  }
};

export const createPaymentOptions = (biljetter: GiftCertificateFragment[]) => [
  createPaymentOption("Swish", PaymentType.Swish),
  ...createForetagsbiljetter(biljetter),
];
