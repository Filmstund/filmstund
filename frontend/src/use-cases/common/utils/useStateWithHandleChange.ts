import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from "react";

export const useStateWithHandleChange = <T>(
  initialValue: T
): [T, (event: ChangeEvent<any>) => void, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(initialValue);
  const handleChange = useCallback(event => {
    setValue(event.target.value);
  }, []);

  return [value, handleChange, setValue];
};
