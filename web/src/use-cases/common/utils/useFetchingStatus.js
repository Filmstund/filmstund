import { useCallback, useState } from "react";

export const useFetchingStatus = (perform) => {
  const [fetching, setFetching] = useState(false);

  const requestData = useCallback(
    (...args) => {
      setFetching(true);
      return perform(...args).then((result) => {
        setFetching(false);
        return result;
      });
    },
    [perform]
  );

  return [fetching, requestData];
};
