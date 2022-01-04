import { gql } from "@apollo/client";
import { sample } from "lodash";
import React from "react";
import { useFadeBetweenValues } from "../../hooks/useFadeBetweenValues";
import { BioordQueryQuery } from "../../../../__generated__/types";
import QuoteBox from "./QuoteBox";
import { suspend } from "suspend-react";
import { client } from "../../../../store/apollo";

const Bioord: React.FC<{ biobudord: BioordQueryQuery["allBiobudord"] }> = ({
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

const query = gql`
  query BioordQuery {
    allBiobudord: allCommandments {
      number
      phrase
    }
  }
`;

export const BioordLoader = () => {
  const { data } = suspend(
    () => client.query<BioordQueryQuery>({ query, canonizeResults: true }),
    ["bioord"]
  );

  return <Bioord biobudord={data.allBiobudord} />;
};

export default BioordLoader;
