import React, { Component } from "react";
import { connect } from "react-redux";

import { showings as showingActions } from "../../store/reducers";

import { SmallHeader } from "../../Header";
import MainButton, { GrayButton } from "../../MainButton";
import Modal from "./Modal";

import createPaymentOptions, { stringifyOption } from "./createPaymentOptions";

class PendingShowing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
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

  renderModalPaymentOptions = () => {
    const { selectedIndex, paymentOptions } = this.state;

    return (
      <Modal key="modal" onRequestClose={() => this.setState({ modalOpen: false })}>
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
        <MainButton onClick={this.handleClickSelectPaymentOption}>Jag hänger på!</MainButton>
      </Modal>
    );
  };

  handleClickSelectPaymentOption = () => {
    const { selectedIndex, paymentOptions } = this.state;
    this.props.handleAttend({ paymentOption: paymentOptions[selectedIndex] })
      .then(result => {
        this.setState({
          modalOpen: false
        });
      });
  };

  handleClickAttend = () => {
    const { handleAttend, me } = this.props;
    const { paymentOptions } = this.state;
    if (me.foretagsbiljetter.length > 0) {
      this.setState({ modalOpen: true });
    } else {

      // Attend with Swish option
      handleAttend({ paymentOption: paymentOptions[0] });
    }
  };

  render() {
    const { isParticipating, handleUnattend } = this.props;
    const { modalOpen } = this.state;

    return [
      modalOpen && this.renderModalPaymentOptions(),
      !isParticipating && <MainButton key="attend" onClick={this.handleClickAttend}>Jag hänger på!</MainButton>,
      isParticipating &&
      <GrayButton key="unattend" onClick={handleUnattend}>Avanmäl</GrayButton>
    ];
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
