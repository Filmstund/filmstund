import React, { Component } from "react";
import { connect } from "react-redux";
import { bioord } from "../store/reducers";
import QuoteBox from "./QuoteBox";

class Bioord extends Component {
  componentWillMount() {
    this.props.dispatch(bioord.actions.requestSingle());
  }

  render() {
    const { bioord } = this.props;
    return (
      <QuoteBox number={bioord.number}>
        {bioord.phrase}
      </QuoteBox>
    );
  }
}

export default connect(state => ({
  bioord: state.bioord.data
}))(Bioord);
