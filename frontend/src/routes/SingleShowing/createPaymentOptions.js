import { capitalize } from "../../Utils";
import moment from "moment";

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
  const now = moment();

  return foretagsbiljetter
    .filter(
      ({ status, expires }) =>
        status === "Available" && now.isBefore(moment(expires))
    )
    .map(({ number, expires }) =>
      createPaymentOption("Företagsbiljett", "foretagsbiljett", number, expires)
    );
};

export const stringifyOption = option => {
  const { displayName } = option;
  if (option.ticketNumber) {
    return displayName + ": " + option.ticketNumber;
  } else {
    return displayName;
  }
};

export default biljetter => [
  createPaymentOption("Swish", "swish"),
  ...createForetagsbiljetter(biljetter)
];
