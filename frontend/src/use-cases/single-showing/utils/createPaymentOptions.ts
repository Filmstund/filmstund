import isAfter from "date-fns/is_after";
import isSameDay from "date-fns/is_same_day";
import { PaymentOption, PaymentType } from "../../../../__generated__/globalTypes";

import { formatYMD } from "../../../lib/dateTools";
import { SingleShowing_me_foretagsbiljetter } from "../containers/__generated__/SingleShowing";

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
  foretagsbiljetter: SingleShowing_me_foretagsbiljetter[]
): DisplayPaymentOption[] => {
  const now = formatYMD(new Date());

  return foretagsbiljetter
    .filter(
      ({ status, expires }) =>
        status === "Available" &&
        (isSameDay(expires, now) || isAfter(expires, now))
    )
    .map(({ number, expires }) =>
      createPaymentOption(
        "Företagsbiljett",
        PaymentType.Foretagsbiljett,
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
  createPaymentOption("Swish", PaymentType.Swish),
  ...createForetagsbiljetter(biljetter)
];
