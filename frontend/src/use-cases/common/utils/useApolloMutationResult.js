import { useState, useCallback } from "react";

export const useApolloMutationResult = mutate => {
  const [{ errors, success }, setResult] = useState({
    errors: null,
    success: false
  });

  const wrappedMutate = useCallback((...args) => {
    return mutate(...args).then(
      res => {
        setResult({ success: true, errors: null });
        return res;
      },
      errors => {
        setResult({ success: false, errors });
        throw errors;
      }
    );
  });

  const clearState = useCallback(() => {
    setResult({ errors: null, success: false });
  });

  return {
    errors,
    success,
    clearState,
    mutate: wrappedMutate
  };
};
