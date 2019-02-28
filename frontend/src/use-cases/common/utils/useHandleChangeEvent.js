import { useCallback } from "react";

export const useHandleChangeEvent = onChange => {
  return useCallback(
    event => {
      console.log(event.target.value, typeof event.target.value);
      onChange(event.target.value);
    },
    [onChange]
  );
};
