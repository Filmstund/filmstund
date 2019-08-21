import { padStart, take } from "lodash-es";

import format from "date-fns/format";

const DATE_MONTH_TIME = "D MMM HH:mm";
const HOUR_MINUTE = "HH:mm";
const DATE_MONTH = "D MMMM YYYY";
const YMD = "YYYY-MM-DD";

const padWithZero = (s: string): string => padStart(s, 2, "0");

const padAndJoinWith = (elems: string[], joiner: string): string =>
  elems.map(padWithZero).join(joiner);

export const getTodaysDate = (): string => format(new Date());

export const showingDateToString = (
  date: string[],
  time: string[] = ["0", "0", "0"]
): string => {
  const dateString = padAndJoinWith(date, "-");
  const timeString = padAndJoinWith(take(time, 3), ":");
  return dateString + " " + timeString;
};

export const formatShowingDateTime = (date: string | number | Date): string =>
  format(date, DATE_MONTH_TIME);

export const formatTime = (date: string | number | Date): string =>
  format(date, HOUR_MINUTE);

export const formatLocalTime = (date: string | number | Date): string =>
  format(new Date(date), HOUR_MINUTE);

export const formatShowingDate = (date: string | number | Date): string =>
  format(date, DATE_MONTH);

export const formatYMD = (date: string | number | Date): string =>
  format(date, YMD);
