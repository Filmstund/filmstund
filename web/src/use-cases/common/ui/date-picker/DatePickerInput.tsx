import React from "react";

import { LocaleUtils } from "react-day-picker";
import DayPickerInputNS from "react-day-picker/DayPickerInput";
import "./date-picker.css";
import { formatYMD } from "../../../../lib/dateTools";
import { DayPickerInputProps } from "react-day-picker/types/Props";

// Vite & rollup has an issue with cjs default export
// https://github.com/vitejs/vite/issues/2139#issuecomment-854960323
function interopDefault<T>(value: T): T {
  return (value as any).default;
}

const DayPickerInput = interopDefault(DayPickerInputNS);

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
