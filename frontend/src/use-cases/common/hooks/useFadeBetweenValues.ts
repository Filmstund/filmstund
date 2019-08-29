import { useEffect, useState } from "react";

export const useFadeBetweenValues = <T>(
  values: T[],
  getNextValue: (v: T[]) => T
) => {
  const [{ faded, value }, setState] = useState({
    faded: false,
    value: getNextValue(values)
  });

  useEffect(
    () => {
      const id = setInterval(() => {
        setState(state => ({ ...state, faded: true }));
        setTimeout(() => {
          setState({ faded: false, value: getNextValue(values) });
        }, 1000);
      }, 10000);

      return () => {
        clearInterval(id);
      };
    },
    [getNextValue, values]
  );

  return { faded, value };
};
