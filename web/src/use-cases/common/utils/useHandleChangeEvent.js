import { useCallback } from "react";

export const useHandleChangeEvent = onChange => {
  return useCallback(
    event => {
      onChange(event.target.value);
    },
    [onChange]
  );
};
