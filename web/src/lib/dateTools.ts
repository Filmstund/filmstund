import format from "date-fns/format";
import parse from "date-fns/parse";
import parseISO from "date-fns/parseISO";

import { padStart, take } from "lodash";

const DATE_MONTH_TIME = "d MMM HH:mm";
const HOUR_MINUTE = "HH:mm";
const DATE_MONTH = "d MMMM yyyy";
const YMD = "yyyy-MM-dd";
// const ISO_DATE = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

const padWithZero = (s: string): string => padStart(s, 2, "0");

const padAndJoinWith = (elems: string[], joiner: string): string =>
  elems.map(padWithZero).join(joiner);

export const getTodaysDate = (): Date => parseDate(format(new Date(), YMD));

export const showingDateToString = (
  date: string[],
  time: string[] = ["0", "0", "0"]
): string => {
  const dateString = padAndJoinWith(date, "-");
  const timeString = padAndJoinWith(take(time, 3), ":");
  return dateString + " " + timeString;
};

export const parseDate = (date: string) => parse(date, YMD, new Date());

export const formatShowingDateTime = (date: string | number | Date): string => {
  if (typeof date === "string") {
    return format(parseISO(date), DATE_MONTH_TIME);
  }
  return format(date, DATE_MONTH_TIME);
};

export const formatTime = (date: string | number | Date): string => {
  if (typeof date === "string") {
    return format(parseISO(date), HOUR_MINUTE);
  }
  return format(date, HOUR_MINUTE);
};

export const formatLocalTime = (date: string | number | Date): string =>
  format(new Date(date), HOUR_MINUTE);

export const formatShowingDate = (date: string | number | Date): string => {
  if (typeof date === "string") {
    return format(parseISO(date), DATE_MONTH);
  }
  return format(date, DATE_MONTH);
};

export const formatYMD = (date: string | number | Date): string => {
  if (typeof date === "string") {
    return format(parseISO(date), YMD);
  }
  return format(date, YMD);
};
