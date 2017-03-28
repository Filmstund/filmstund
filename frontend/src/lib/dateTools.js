import moment from "moment";
import _ from "lodash";

const DATE_MONTH_TIME = "D MMM HH:mm";

const padWithZero = (s) => _.padStart(s, 2, '0');

const showingDateToString = (date, time) => {
    const dateString = date.map(padWithZero).join('-');
    const timeString = _.take(time, 3).map(padWithZero).join(':');
    return dateString + " " + timeString;
};

export const formatShowingDate = (date, time) =>
    moment(showingDateToString(date, time)).format(DATE_MONTH_TIME);