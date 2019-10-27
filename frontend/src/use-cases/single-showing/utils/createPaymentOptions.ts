import isAfter from "date-fns/isAfter";
import isSameDay from "date-fns/isSameDay";
import { GiftCertificateDTO_Status, PaymentOption, PaymentType } from "../../../__generated__/globalTypes";

import { formatYMD, parseDate } from "../../../lib/dateTools";

export interface DisplayPaymentOption extends PaymentOption {
  displayName: string;
  type: PaymentType;
  ticketNumber?: string | null;
  suffix?: string | null;
}

export interface SingleShowing_me_foretagsbiljetter {
  expires: string;
  number: string;
  status: GiftCertificateDTO_Status;
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
  foretagsbiljetter: SingleShowing_me_foretagsbiljetter[]
): DisplayPaymentOption[] => {
  const now = formatYMD(new Date());

  return foretagsbiljetter
    .filter(
      ({ status, expires }) =>
        status === "AVAILABLE" &&
        (isSameDay(parseDate(expires), parseDate(now)) || isAfter(parseDate(expires), parseDate(now)))
    )
    .map(({ number, expires }) =>
      createPaymentOption(
        "Företagsbiljett",
        PaymentType.GIFT_CERTIFICATE,
        number,
        expires
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

export default (biljetter: SingleShowing_me_foretagsbiljetter[]) => [
  createPaymentOption("Swish", PaymentType.SWISH),
  ...createForetagsbiljetter(biljetter)
];
