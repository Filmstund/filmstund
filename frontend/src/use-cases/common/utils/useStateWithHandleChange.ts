import { useState, useCallback } from "react";

export const useStateWithHandleChange = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const handleChange = useCallback(event => {
    setValue(event.target.value);
  }, []);

  return [value, handleChange, setValue];
};
