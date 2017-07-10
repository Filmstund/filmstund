import React, { Component } from "react";
import { connect } from "react-redux";

import { showings as showingActions } from "../../store/reducers";

import { SmallHeader } from "../../Header";
import MainButton, { GrayButton } from "../../MainButton";
import ParticipantList from "./ParticipantsList";

class PendingShowing extends Component {
  state = {
    paymentOption: 'swish'
  };

  setPaymentOption = (e) => {
    const {target: { value }} = e;
    this.setState({
      paymentOption: value
    })
  };

  renderPaymentOptions = () => {
    const { me: { foretagsbiljetter } } = this.props;
    const { paymentOption } = this.state;

    return (<div>
      <SmallHeader>Betalningsalternativ</SmallHeader>
      <select name="betalningsalternativ" value={paymentOption} onChange={this.setPaymentOption} >
        <option value="swish">Swish</option>
        {foretagsbiljetter.map(ftg => <option key={ftg} value={ftg}>Företagsbiljett: {ftg} </option>)}
      </select>
    </div>)
  };

  renderAttendAction = () => {
    const { handleAttend, me } = this.props;
    const { paymentOption } = this.state;
    return (<div>
      {me.foretagsbiljetter && me.foretagsbiljetter.length > 0 && this.renderPaymentOptions(me.foretagsbiljetter)}
      <MainButton onClick={() => handleAttend(paymentOption)}>Jag hänger på!</MainButton>
    </div>)

  };

  render() {
    const {  showing,
      isParticipating,
      handleAttend,
      handleUnattend } = this.props;

    return (<div>
      {!isParticipating &&
      this.renderAttendAction()}
      {isParticipating && <GrayButton onClick={handleUnattend}>Avanmäl</GrayButton>}
      <ParticipantList participants={showing.participants}/>

    </div>)

  }
}

const mapStateToProps = (state) => ({
  me: state.me.data,
});

const mapDispatchToProps = (dispatch, props) => {
  const { requestAttend, requestUnattend } = showingActions.actions;
  const { showing } = props;

  return {
    handleAttend: (paymentOption) => dispatch(requestAttend(showing.id, paymentOption)),
    handleUnattend: () => dispatch(requestUnattend(showing.id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PendingShowing);
