import React, { Component } from "react";
import { connect } from "react-redux";

import { showings as showingActions } from "../../store/reducers";

import { SmallHeader } from "../../Header";
import MainButton, { GrayButton, ButtonContainer } from "../../MainButton";
import ParticipantList from "./ParticipantsList";

import createPaymentOptions, { stringifyOption } from "./createPaymentOptions";

class PendingShowing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      paymentOptions: createPaymentOptions(props.me.foretagsbiljetter || [])
    };
  }

  setPaymentOption = e => {
    const { target: { value } } = e;
    this.setState({
      selectedIndex: value
    });
  };

  renderPaymentOptions = () => {
    const { selectedIndex, paymentOptions } = this.state;

    return (
      <div>
        <SmallHeader>Betalningsalternativ</SmallHeader>
        <select
          name="betalningsalternativ"
          value={selectedIndex}
          onChange={this.setPaymentOption}
        >
          {paymentOptions.map((option, index) =>
            <option key={index} value={index}>
              {stringifyOption(option)}
            </option>
          )}
        </select>
      </div>
    );
  };

  renderAttendAction = () => {
    const { handleAttend, me } = this.props;
    const { selectedIndex, paymentOptions } = this.state;
    return (
      <div>
        {me.foretagsbiljetter.length > 0 && this.renderPaymentOptions()}
        <MainButton
          onClick={() =>
            handleAttend({ paymentOption: paymentOptions[selectedIndex] })}
        >
          Jag hänger på!
        </MainButton>
      </div>
    );
  };

  render() {
    const { showing, isParticipating, handleUnattend } = this.props;

    return (
      <div>
        <ButtonContainer>
          {!isParticipating && this.renderAttendAction()}
          {isParticipating &&
            <GrayButton onClick={handleUnattend}>Avanmäl</GrayButton>}
        </ButtonContainer>
        <ParticipantList participants={showing.participants} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  me: state.me.data
});

const mapDispatchToProps = (dispatch, props) => {
  const { requestAttend, requestUnattend } = showingActions.actions;
  const { showing } = props;

  return {
    handleAttend: data => dispatch(requestAttend(showing.id, data)),
    handleUnattend: () => dispatch(requestUnattend(showing.id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PendingShowing);
