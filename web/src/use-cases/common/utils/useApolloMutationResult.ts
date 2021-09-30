import { useCallback, useState } from "react";

export const useApolloMutationResult = <T extends Function>(mutate: T) => {
  const [{ errors, success }, setResult] = useState({
    errors: null,
    success: false,
  });

  const wrappedMutate = useCallback(
    (...args) => {
      return mutate(...args).then(
        (res: any) => {
          setResult({ success: true, errors: null });
          return res;
        },
        (errors: any) => {
          setResult({ success: false, errors });
          throw errors;
        }
      );
    },
    [mutate]
  ) as unknown as T;

  const clearState = useCallback(() => {
    setResult({ errors: null, success: false });
  }, []);

  return {
    errors,
    success,
    clearState,
    mutate: wrappedMutate,
  };
};
