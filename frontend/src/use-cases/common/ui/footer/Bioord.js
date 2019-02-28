import React, { useState, useEffect } from "react";
import QuoteBox from "./QuoteBox";
import { sample } from "lodash-es";
import { branch, compose, renderComponent } from "recompose";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

const Bioord = ({ data }) => {
  const { faded, value: budord } = useFadeBetweenValues(
    data.allBiobudord,
    sample
  );

  return (
    <QuoteBox faded={faded} number={budord.number}>
      {budord.phrase}
    </QuoteBox>
  );
};

const useFadeBetweenValues = (values, getNextValue) => {
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

const Loader = branch(
  ({ data: { loading } }) => loading,
  renderComponent(() => null)
);

const data = graphql(gql`
  query BioordQuery {
    allBiobudord {
      number
      phrase
    }
  }
`);

export default compose(
  data,
  Loader
)(Bioord);
