import React, { useCallback } from "react";

import DayPicker, { LocaleUtils } from "react-day-picker";
import "./date-picker.css";
import { formatYMD } from "../../../../lib/dateTools";

const localeUtils = {
  ...LocaleUtils,
  getFirstDayOfWeek: () => 1,
};

const DatePicker = ({ value, onChange, ...props }) => {
  const handleClick = useCallback(
    (day, modifiers) => {
      if (modifiers.disabled) {
        return;
      }
      onChange(day);
    },
    [onChange]
  );

  return (
    <DayPicker
      initialMonth={value}
      value={value}
      onDayClick={handleClick}
      formatDate={formatYMD}
      localeUtils={localeUtils}
      selectedDays={value}
      showOutsideDays
      {...props}
    />
  );
};

export default DatePicker;
