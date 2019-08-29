import { useEffect, useState } from "react";

export const useFadeState = (): [boolean, () => void] => {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);

  const forceUpdate = () => setCount(c => c + 1);

  useEffect(
    () => {
      const timeout = setTimeout(() => {
        setActive(false);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    },
    [count]
  );

  const outterSetActive = () => {
    setActive(true);
    forceUpdate();
  };

  return [active, outterSetActive];
};
