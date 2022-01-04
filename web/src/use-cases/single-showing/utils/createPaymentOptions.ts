import isAfter from "date-fns/isAfter";
import isSameDay from "date-fns/isSameDay";
import {
  GiftCertificate_Status,
  PaymentOption,
  PaymentType,
  SingleShowingQuery,
} from "../../../__generated__/types";

import { formatYMD, parseDate } from "../../../lib/dateTools";

export interface DisplayPaymentOption extends PaymentOption {
  displayName: string;
  type: PaymentType;
  ticketNumber?: string | null;
  suffix?: string | null;
}

const createPaymentOption = (
  displayName: string,
  type: PaymentType,
  ticketNumber: string | null = null,
  suffix: string | null = null
): DisplayPaymentOption => {
  if (ticketNumber) {
    return { displayName, type, ticketNumber, suffix };
  }
  return { displayName, type };
};

const createForetagsbiljetter = (
  foretagsbiljetter: SingleShowingQuery["me"]["giftCertificates"]
): DisplayPaymentOption[] => {
  const now = formatYMD(new Date());

  return foretagsbiljetter
    .filter(
      ({ status, expireTime }) =>
        status === GiftCertificate_Status.Available &&
        (isSameDay(parseDate(expireTime), parseDate(now)) ||
          isAfter(parseDate(expireTime), parseDate(now)))
    )
    .map(({ number, expireTime }) =>
      createPaymentOption(
        "Företagsbiljett",
        PaymentType.GiftCertificate,
        number,
        expireTime
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

export const createPaymentOptions = (
  biljetter: SingleShowingQuery["me"]["giftCertificates"]
) => [
  createPaymentOption("Swish", PaymentType.Swish),
  ...createForetagsbiljetter(biljetter),
];
