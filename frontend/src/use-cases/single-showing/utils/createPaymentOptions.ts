import isAfter from "date-fns/isAfter";
import isSameDay from "date-fns/isSameDay";
import { GiftCertificateDTO_Status, PaymentOption, PaymentType } from "../../../__generated__/globalTypes";

import { formatYMD, parseDate } from "../../../lib/dateTools";
import { SingleShowing_me_giftCertificates } from "../containers/__generated__/SingleShowing";

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
  foretagsbiljetter: SingleShowing_me_giftCertificates[]
): DisplayPaymentOption[] => {
  const now = formatYMD(new Date());

  return foretagsbiljetter
    .filter(
      ({ status, expiresAt }) =>
        status === GiftCertificateDTO_Status.AVAILABLE &&
        (isSameDay(parseDate(expiresAt), parseDate(now)) || isAfter(parseDate(expiresAt), parseDate(now)))
    )
    .map(({ number, expiresAt }) =>
      createPaymentOption(
        "Företagsbiljett",
        PaymentType.GIFT_CERTIFICATE,
        number,
        expiresAt
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

export default (biljetter: SingleShowing_me_giftCertificates[]) => [
  createPaymentOption("Swish", PaymentType.SWISH),
  ...createForetagsbiljetter(biljetter)
];
