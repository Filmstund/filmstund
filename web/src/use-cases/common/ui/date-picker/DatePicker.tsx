import React from "react";

import {
  DayClickEventHandler,
  DayPicker,
  DayPickerDefaultProps,
} from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./date-picker.css";
import sv from "date-fns/locale/sv";

interface DatePickerProps extends Omit<DayPickerDefaultProps, "selected"> {
  value: Date;
  onChange: (value: Date) => void;
}

const DatePicker: React.VFC<DatePickerProps> = ({
  value,
  onChange,
  ...props
}) => {
  const handleClick: DayClickEventHandler = (day, activeModifiers) => {
    if (!activeModifiers.disabled) {
      onChange(day);
    }
  };

  return (
    <DayPicker
      className={"my-date-picker"}
      mode={"single"}
      defaultMonth={value}
      selected={value}
      locale={sv}
      onDayClick={handleClick}
      modifiersClassNames={{
        filmstadendays: "filmstadendays",
      }}
      showOutsideDays
      {...props}
    />
  );
};

export default DatePicker;
