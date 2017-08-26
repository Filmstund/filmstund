import moment from "moment";
import "moment/locale/sv";
import { padStart, take } from "lodash";

moment.locale("sv");

const DATE_MONTH_TIME = "D MMM HH:mm";
const DATE_MONTH = "D MMMM YYYY";
const YMD = "YYYY-MM-DD";

const padWithZero = s => padStart(s, 2, "0");

const padAndJoinWith = (elems, joiner) => elems.map(padWithZero).join(joiner);

export const getTodaysDate = () => moment().format();

export const showingDateToString = (date, time = ["0", "0", "0"]) => {
  const dateString = padAndJoinWith(date, "-");
  const timeString = padAndJoinWith(take(time, 3), ":");
  return dateString + " " + timeString;
};

export const formatShowingDateTime = date =>
  moment(date).format(DATE_MONTH_TIME);

export const formatShowingDate = date => moment(date).format(DATE_MONTH);

export const formatYMD = date => moment(date).format(YMD);
