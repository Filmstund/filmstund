import { useState, useCallback } from "react";

export const useStateWithHandleChange = initialValue => {
  const [value, setValue] = useState(initialValue);
  const handleChange = useCallback(event => {
    setValue(event.target.value);
  }, []);

  return [value, handleChange, setValue];
};
