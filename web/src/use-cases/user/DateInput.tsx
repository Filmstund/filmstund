import { useHandleChangeEvent } from "../common/utils/useHandleChangeEvent";
import Input from "../common/ui/Input";
import React, { lazy } from "react";

const DatePickerInput = lazy(
  () => import("../common/ui/date-picker/DatePickerInput")
);

const isIOS = /iPad|iPhone|iPod/.test(navigator.platform);

interface DateInputProps {
  onChange: (value: string) => void;
  value: string;
}

export const DateInput: React.VFC<DateInputProps> = ({
  onChange,
  ...props
}: any) => {
  const handleChange = useHandleChangeEvent(onChange);

  if (isIOS) {
    return <Input type="date" onChange={handleChange} {...props} />;
  } else {
    return <DatePickerInput onDayChange={onChange} {...props} />;
  }
};
