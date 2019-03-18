import gql from "graphql-tag";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { compose } from "react-apollo";
import { withRouter } from "react-router";

import { useMarkAsBought } from "../../apollo/mutations/showings/useMarkAsBought";
import { useTogglePaidChange } from "../../apollo/mutations/showings/useTogglePaidChange";
import { useAddTickets } from "../../apollo/mutations/useAddTickets";
import MainButton, { GrayButton } from "../../use-cases/common/ui/MainButton";
import { navigateToEditShowing } from "../common/navigators";
import BuyModal from "./BuyModal";

class AdminAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adminMessage: null,
      ticketPrice: props.showing.price / 100,
      cinemaTicketUrls: [],
      buyData: null,
      loadingModal: false,
      showModal: false
    };
  }

  setPrice = price => {
    const int = parseInt(price, 10);

    this.setState({
      ticketPrice: isNaN(int) ? "" : int
    });
  };

  setCinemaTicketUrls = cinemaTicketUrls => {
    this.setState({
      cinemaTicketUrls
    });
  };

  handlePaidChange = info => {
    const { togglePaidChange, showing } = this.props;
    const { id, user, hasPaid, amountOwed } = info;

    togglePaidChange({
      id,
      userId: user.id,
      showingId: showing.id,
      amountOwed,
      hasPaid: !hasPaid
    });
  };

  handleStartBooking = async () => {
    this.setState({
      showModal: true,
      loadingModal: true,
      errors: null
    });

    await this.props.onBeforeOpenBuyModal();

    this.setState({
      loadingModal: false
    });
  };

  handleMarkBought = event => {
    event.preventDefault();

    const { cinemaTicketUrls, ticketPrice } = this.state;

    const nonEmptyTicketUrls = cinemaTicketUrls.filter(
      line => line.trim().length !== 0
    );

    const { showing } = this.props;
    this.props
      .addTickets(showing.id, nonEmptyTicketUrls)
      .then(() =>
        this.props.markShowingBought(showing.id, {
          showing: {
            private: showing.private,
            payToUser: showing.payToUser.id,
            location: showing.location.name,
            time: showing.time,
            sfScreen: showing.sfScreen
              ? { name: showing.sfScreen.name, sfId: showing.sfScreen.sfId }
              : null,
            price: ticketPrice * 100
          }
        })
      )
      .then(() => {
        this.setState({ showModal: false });
      })
      .catch(errors => {
        this.setState({ errors });
      });
  };

  handleEdit = () => {
    const { history, showing } = this.props;
    navigateToEditShowing(history, showing);
  };

  render() {
    const { showing } = this.props;
    const { ticketsBought } = showing;

    const {
      errors,
      ticketPrice,
      cinemaTicketUrls,
      showModal,
      loadingModal,
      adminMessage
    } = this.state;

    return (
      <>
        {showModal && (
          <BuyModal
            errors={errors}
            loading={loadingModal}
            setPrice={this.setPrice}
            setCinemaTicketUrls={this.setCinemaTicketUrls}
            showing={showing}
            handleMarkBought={this.handleMarkBought}
            handlePaidChange={this.handlePaidChange}
            ticketPrice={ticketPrice}
            cinemaTicketUrls={cinemaTicketUrls}
            adminPaymentDetails={showing.adminPaymentDetails}
            closeModal={() => this.setState({ showModal: false })}
          />
        )}
        {adminMessage && <div>{adminMessage}</div>}
        {ticketsBought ? (
          <GrayButton onClick={this.handleStartBooking}>
            Visa betalningsstatus
          </GrayButton>
        ) : (
          <MainButton onClick={this.handleStartBooking}>
            Alla är med, nu bokar vi!
          </MainButton>
        )}
        <GrayButton onClick={this.handleEdit}>Ändra besök</GrayButton>
      </>
    );
  }
}

AdminAction.propTypes = {
  showing: PropTypes.object.isRequired
};

const AdminActionComponent = compose(withRouter)(props => {
  const addTickets = useAddTickets();
  const togglePaidChange = useTogglePaidChange();
  const markAsBought = useMarkAsBought();

  return (
    <AdminAction
      {...props}
      addTickets={addTickets}
      togglePaidChange={togglePaidChange}
      markAsBought={markAsBought}
    />
  );
});

AdminActionComponent.fragments = {
  showing: gql`
    fragment ShowingAdmin on Showing {
      id
      price
      private
      sfScreen {
        sfId
        name
      }
      payToUser {
        id
      }
      adminPaymentDetails {
        sfBuyLink
        sfData {
          user {
            id
            nick
            firstName
            lastName
          }
          sfMembershipId
          foretagsbiljett
        }
        participantPaymentInfos {
          id
          hasPaid
          amountOwed
          user {
            id
            nick
            name
            phone
          }
        }
      }
    }
  `
};

export default AdminActionComponent;
