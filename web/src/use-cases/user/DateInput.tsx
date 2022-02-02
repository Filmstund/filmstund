import Input from "../common/ui/Input";
import React, { ChangeEvent } from "react";

interface DateInputProps {
  onChange: (value: string) => void;
  value: string;
}

export const DateInput: React.VFC<DateInputProps> = ({
  onChange,
  ...props
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return <Input type="date" required onChange={handleChange} {...props} />;
};
