import React from "react";

import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";

import { formatYMD } from "./lib/dateTools";

const DatePicker = ({ value, onChange, dayPickerProps = {}, ...props }) => (
  <DayPickerInput
    value={value}
    onDayChange={onChange}
    formatDate={formatYMD}
    dayPickerProps={{
      selectedDays: value,
      ...dayPickerProps
    }}
    {...props}
  />
);

export default DatePicker;
