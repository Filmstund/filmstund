import { capitalize } from "../../Utils";
import moment from "moment";

const createPaymentOption = (type, ticketNumber = null, suffix = null) => {
  type = capitalize(type);
  if (ticketNumber) {
    return { type, ticketNumber, suffix };
  }
  return { type };
};

const createForetagsbiljetter = foretagsbiljetter => {
  const now = moment();

  return foretagsbiljetter
    .filter(
      ({ status, expires }) =>
        status === "Available" && now.isBefore(moment(expires))
    )
    .map(({ number, expires }) =>
      createPaymentOption("företagsbiljett", number, expires)
    );
};

export const stringifyOption = option => {
  const type = capitalize(option.type);
  if (option.ticketNumber) {
    return type + ": " + option.ticketNumber;
  } else {
    return type;
  }
};

export default biljetter => [
  createPaymentOption("swish"),
  ...createForetagsbiljetter(biljetter)
];
