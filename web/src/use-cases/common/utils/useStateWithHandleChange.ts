import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

export const useStateWithHandleChange = <T>(
  initialValue: T,
  transformer?: (x: string) => T
): [
  T,
  (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  Dispatch<SetStateAction<T>>
] => {
  const [value, setValue] = useState<T>(initialValue);
  const handleChange = (event: ChangeEvent<any>) => {
    setValue(
      transformer ? transformer(event.target.value) : event.target.value
    );
  };

  return [value, handleChange, setValue];
};
