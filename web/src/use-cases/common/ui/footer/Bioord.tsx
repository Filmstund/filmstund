import { gql, useQuery } from "@apollo/client";
import { sample } from "lodash-es";
import React from "react";
import { useFadeBetweenValues } from "../../hooks/useFadeBetweenValues";
import {
  BioordQuery,
  BioordQuery_allBiobudord,
} from "./__generated__/BioordQuery";
import QuoteBox from "./QuoteBox";

const Bioord: React.FC<{ biobudord: BioordQuery_allBiobudord[] }> = ({
  biobudord,
}) => {
  const { faded, value: budord } = useFadeBetweenValues(biobudord, sample);

  if (!budord) {
    return null;
  }

  return (
    <QuoteBox faded={faded} number={budord.number}>
      {budord.phrase}
    </QuoteBox>
  );
};

const useBioord = () =>
  useQuery<BioordQuery>(gql`
    query BioordQuery {
      allBiobudord {
        number
        phrase
      }
    }
  `);

export const BioordLoader = () => {
  const { data } = useBioord();

  if (!data) {
    return null;
  }

  return <Bioord biobudord={data.allBiobudord} />;
};

export default BioordLoader;
