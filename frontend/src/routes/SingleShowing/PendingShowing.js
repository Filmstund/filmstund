import React, { Component } from "react";
import { connect } from "react-redux";

import { showings as showingActions } from "../../store/reducers";

import { SmallHeader } from "../../Header";
import MainButton, { GrayButton } from "../../MainButton";
import ParticipantList from "./ParticipantsList";
import moment from "moment";

import { capitalize } from "../../Utils";

const createPaymentOption = (type, extra = null, suffix = null) => {
  type = capitalize(type);
  if (extra) {
    return {
      type: type,
      extra: extra,
      suffix
    };
  }
  return {
    type: type
  };
};

const stringifyOption = option => {
  const type = capitalize(option.type);
  if (option.extra) {
    return type + ": " + option.extra;
  } else {
    return type;
  }
};

const createForetagsbiljetter = foretagsbiljetter => {
  return foretagsbiljetter
    .filter(
      ftg =>
        ftg.status === "Available" && moment().isBefore(moment(ftg.expires))
    )
    .map(ftg => createPaymentOption("företagsbiljett", ftg.value, ftg.expires));
};

class PendingShowing extends Component {
  state = {
    paymentOptionIndex: 0,
    paymentOptions: [
      createPaymentOption("swish"),
      ...createForetagsbiljetter(this.props.me.foretagsbiljetter)
    ]
  };

  setPaymentOption = e => {
    const { target: { value } } = e;
    this.setState({
      paymentOptionIndex: value
    });
  };

  renderPaymentOptions = () => {
    const { paymentOptionIndex, paymentOptions } = this.state;

    return (
      <div>
        <SmallHeader>Betalningsalternativ</SmallHeader>
        <select
          name="betalningsalternativ"
          value={paymentOptionIndex}
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
    const { paymentOptionIndex, paymentOptions } = this.state;
    return (
      <div>
        {me.foretagsbiljetter &&
          me.foretagsbiljetter.length > 0 &&
          this.renderPaymentOptions(me.foretagsbiljetter)}
        <MainButton
          onClick={() =>
            handleAttend({ paymentOption: paymentOptions[paymentOptionIndex] })}
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
        {!isParticipating && this.renderAttendAction()}
        {isParticipating &&
          <GrayButton onClick={handleUnattend}>Avanmäl</GrayButton>}
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
