import padStart from "lodash-es/padStart";
import take from "lodash-es/take";

import format from "date-fns/format";

const DATE_MONTH_TIME = "D MMM HH:mm";
const HOUR_MINUTE = "HH:mm";
const DATE_MONTH = "D MMMM YYYY";
const YMD = "YYYY-MM-DD";

const padWithZero = s => padStart(s, 2, "0");

const padAndJoinWith = (elems, joiner) => elems.map(padWithZero).join(joiner);

export const getTodaysDate = () => format(new Date());

export const showingDateToString = (date, time = ["0", "0", "0"]) => {
  const dateString = padAndJoinWith(date, "-");
  const timeString = padAndJoinWith(take(time, 3), ":");
  return dateString + " " + timeString;
};

export const formatShowingDateTime = date => format(date, DATE_MONTH_TIME);

export const formatTime = date => format(date, HOUR_MINUTE);

export const formatLocalTime = date => format(new Date(date), HOUR_MINUTE);

export const formatShowingDate = date => format(date, DATE_MONTH);

export const formatYMD = date => format(date, YMD);
