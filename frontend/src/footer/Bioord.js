import React, { Component } from "react";
import QuoteBox from "./QuoteBox";
import _ from "lodash";
import { branch, compose, renderComponent } from "recompose";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

class Bioord extends Component {
  state = {
    budord: {},
    faded: true
  };

  componentDidMount() {
    this.interval = setInterval(this.resampleBudord, 10000);
    this.resampleBudord();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  resampleBudord = () => {
    this.setState({ faded: true });
    setTimeout(() => {
      this.setState((state, { data }) => ({
        budord: _.sample(data.allBiobudord),
        faded: false
      }));
    }, 1000);
  };

  render() {
    const { budord, faded } = this.state;

    return (
      <QuoteBox faded={faded} number={budord.number}>
        {budord.phrase}
      </QuoteBox>
    );
  }
}

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

export default compose(data, Loader)(Bioord);
