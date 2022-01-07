import React from "react";

import { LocaleUtils } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "./date-picker.css";
import { formatYMD } from "../../../../lib/dateTools";
import { DayPickerInputProps } from "react-day-picker/types/Props";

const localeUtils = {
  ...LocaleUtils,
  getFirstDayOfWeek: () => 1,
};

interface Props extends DayPickerInputProps {
  value: string;
}

const DatePickerInput: React.VFC<Props> = ({
  value,
  dayPickerProps = {},
  ...props
}) => (
  <DayPickerInput
    value={value}
    formatDate={formatYMD}
    dayPickerProps={{
      localeUtils,
      selectedDays: new Date(value),
      ...dayPickerProps,
    }}
    {...props}
  />
);

export default DatePickerInput;
