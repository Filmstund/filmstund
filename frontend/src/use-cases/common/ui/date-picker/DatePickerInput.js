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
    formatDate={formatYMD}
    dayPickerProps={{
      localeUtils,
      selectedDays: value,
      ...dayPickerProps
    }}
    {...props}
  />
);

export default DatePickerInput;
