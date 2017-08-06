import { capitalize } from "../../Utils";
import moment from "moment";

const createPaymentOption = (type, extra = null, suffix = null) => {
  type = capitalize(type);
  if (extra) {
    return { type, extra, suffix };
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
    .map(({ value, expires }) =>
      createPaymentOption("företagsbiljett", value, expires)
    );
};

export const stringifyOption = option => {
  const type = capitalize(option.type);
  if (option.extra) {
    return type + ": " + option.extra;
  } else {
    return type;
  }
};

export default biljetter => [
  createPaymentOption("swish"),
  ...createForetagsbiljetter(biljetter)
];
