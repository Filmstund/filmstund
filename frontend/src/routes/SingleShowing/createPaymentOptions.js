import { capitalize } from "../../Utils";
import moment from "moment";
import { formatYMD } from "../../lib/dateTools";

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
  const now = formatYMD(moment());

  return foretagsbiljetter
    .filter(
      ({ status, expires }) =>
        status === "Available" && moment(expires).isSameOrAfter(now)
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
