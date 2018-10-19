import React from "react";

import { LocaleUtils } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "./date-picker.css";
import { formatYMD } from "../../../../lib/dateTools";

const localeUtils = {
  ...LocaleUtils,
  getFirstDayOfWeek: () => 1
};

const DatePickerInput = ({
  value,
  onChange,
  dayPickerProps = {},
  ...props
}) => (
  <DayPickerInput
    value={value}
    onDayChange={onChange}
    inputProps={{
      style: {
        borderRadius: 4,
        border: "1px solid gray",
        fontSize: "1.1em",
        padding: "0.5em 1em",
        width: "100%"
      }
    }}
    formatDate={formatYMD}
    dayPickerProps={{
      localeUtils,
      selectedDays: value,
      ...props
    }}
    {...dayPickerProps}
  />
);

export default DatePickerInput;
