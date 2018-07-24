import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../../store/apollo";

import { SmallHeader } from "../../use-cases/common/ui/Header";
import MainButton, { GrayButton } from "../../use-cases/common/ui/MainButton";
import Modal from "../../use-cases/common/ui/Modal";

import createPaymentOptions, { stringifyOption } from "./createPaymentOptions";

class PendingShowing extends Component {
  state = {
    modalOpen: false,
    selectedIndex: 0
  };

  setPaymentOption = e => {
    const {
      target: { value }
    } = e;
    this.setState({
      selectedIndex: value
    });
  };

  renderModalPaymentOptions = () => {
    const { selectedIndex } = this.state;
    const paymentOptions = this.getPaymentOptions();

    return (
      <Modal onRequestClose={() => this.setState({ modalOpen: false })}>
        <SmallHeader>Betalningsalternativ</SmallHeader>
        <select
          name="betalningsalternativ"
          value={selectedIndex}
          onChange={this.setPaymentOption}
        >
          {paymentOptions.map((option, index) => (
            <option key={index} value={index}>
              {stringifyOption(option)}
            </option>
          ))}
        </select>
        <MainButton onClick={this.handleClickSelectPaymentOption}>
          Jag hänger på!
        </MainButton>
      </Modal>
    );
  };

  getPaymentOptions = () => {
    const {
      data: {
        me: { foretagsbiljetter }
      }
    } = this.props;
    return createPaymentOptions(foretagsbiljetter);
  };

  handleClickSelectPaymentOption = () => {
    const paymentOptions = this.getPaymentOptions();
    const { selectedIndex } = this.state;

    this.attendWithPaymentOption(paymentOptions[selectedIndex]);
  };

  attendWithPaymentOption = paymentOption => {
    const { attendShowing } = this.props;
    const { type, ticketNumber } = paymentOption;
    attendShowing({
      paymentOption: {
        type,
        ticketNumber
      }
    }).then(result => {
      this.setState({ modalOpen: false });
    });
  };

  handleClickAttend = () => {
    const paymentOptions = this.getPaymentOptions();
    if (paymentOptions.length > 1) {
      this.setState({ modalOpen: true });
    } else {
      // Attend with Swish option
      this.attendWithPaymentOption(paymentOptions[0]);
    }
  };

  render() {
    const { isParticipating, unattendShowing } = this.props;
    const { modalOpen } = this.state;

    return (
      <React.Fragment>
        {modalOpen && this.renderModalPaymentOptions()}
        {!isParticipating && (
          <MainButton onClick={this.handleClickAttend}>
            Jag hänger på!
          </MainButton>
        )}
        {isParticipating && (
          <GrayButton onClick={unattendShowing}>Avanmäl</GrayButton>
        )}
      </React.Fragment>
    );
  }
}

const participantsFragment = gql`
  fragment ShowingParticipant on Showing {
    id
    participants {
      paymentType
      user {
        id
        nick
        firstName
        lastName
        avatar
      }
    }
  }
`;

const attendShowing = graphql(
  gql`
    mutation AttendShowing($showingId: UUID!, $paymentOption: PaymentOption!) {
      attendShowing(showingId: $showingId, paymentOption: $paymentOption) {
        ...ShowingParticipant
      }
    }
    ${participantsFragment}
  `,
  {
    props: ({ mutate, ownProps: { showingId } }) => ({
      attendShowing: ({ paymentOption }) =>
        wrapMutate(mutate, { showingId, paymentOption })
    })
  }
);

const unattendShowing = graphql(
  gql`
    mutation UnattendShowing($showingId: UUID!) {
      unattendShowing(showingId: $showingId) {
        ...ShowingParticipant
      }
    }
    ${participantsFragment}
  `,
  {
    props: ({ mutate, ownProps: { showingId } }) => ({
      unattendShowing: () => wrapMutate(mutate, { showingId })
    })
  }
);

const data = graphql(gql`
  query PendingShowingQuery {
    me: currentUser {
      foretagsbiljetter {
        expires
        number
        status
      }
    }
  }
`);

export default compose(
  attendShowing,
  unattendShowing,
  data
)(PendingShowing);
