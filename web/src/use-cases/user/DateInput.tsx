import { useHandleChangeEvent } from "../common/utils/useHandleChangeEvent";
import Input from "../common/ui/Input";
import React from "react";

interface DateInputProps {
  onChange: (value: string) => void;
  value: string;
}

export const DateInput: React.VFC<DateInputProps> = ({
  onChange,
  ...props
}) => {
  const handleChange = useHandleChangeEvent(onChange);

  return <Input type="date" required onChange={handleChange} {...props} />;
};
