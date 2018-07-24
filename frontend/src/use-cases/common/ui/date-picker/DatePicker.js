import React, { Component } from "react";

import DayPicker, { LocaleUtils } from "react-day-picker";
import "./date-picker.css";
import { formatYMD } from "../../../../lib/dateTools";

const localeUtils = {
  ...LocaleUtils,
  getFirstDayOfWeek: () => 1
};

class DatePicker extends Component {
  handleClick = (day, modifiers) => {
    if (modifiers.disabled) {
      return;
    }
    const { onChange } = this.props;
    onChange(day);
  };

  render() {
    const { value, onChange, ...props } = this.props;

    return (
      <DayPicker
        value={value}
        onDayClick={this.handleClick}
        formatDate={formatYMD}
        localeUtils={localeUtils}
        selectedDays={value}
        showOutsideDays
        {...props}
      />
    );
  }
}

export default DatePicker;
