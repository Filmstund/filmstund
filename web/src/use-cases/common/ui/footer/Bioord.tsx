import { sample } from "lodash";
import React from "react";
import { useFadeBetweenValues } from "../../hooks/useFadeBetweenValues";
import QuoteBox from "./QuoteBox";
import { useBioordQuery } from "../../../../__generated__/types";

export const Bioord: React.VFC = () => {
  const [{ data }] = useBioordQuery();

  const { faded, value: budord } = useFadeBetweenValues(
    data!.allCommandments,
    sample
  );

  if (!budord) {
    return null;
  }

  return (
    <QuoteBox faded={faded} number={budord.number}>
      {budord.phrase}
    </QuoteBox>
  );
};
