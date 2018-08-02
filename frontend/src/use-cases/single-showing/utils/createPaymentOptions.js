import { capitalize } from "../../../lib/Utils";
import { formatYMD } from "../../../lib/dateTools";
import isSameDay from "date-fns/is_same_day";
import isAfter from "date-fns/is_after";

const createPaymentOption = (
  displayName,
  type,
  ticketNumber = null,
  suffix = null
) => {
  type = capitalize(type);
  if (ticketNumber) {
    return { displayName, type, ticketNumber, suffix };
  }
  return { displayName, type };
};

const createForetagsbiljetter = foretagsbiljetter => {
  const now = formatYMD(new Date());

  return foretagsbiljetter
    .filter(
      ({ status, expires }) =>
        status === "Available" &&
        (isSameDay(expires, now) || isAfter(expires, now))
    )
    .map(({ number, expires }) =>
      createPaymentOption("Företagsbiljett", "foretagsbiljett", number, expires)
    );
};

export const stringifyOption = option => {
  const { displayName } = option;
  if (option.ticketNumber) {
    return `${displayName}: ${option.ticketNumber} (${option.suffix})`;
  } else {
    return displayName;
  }
};

export default biljetter => [
  createPaymentOption("Swish", "swish"),
  ...createForetagsbiljetter(biljetter)
];
