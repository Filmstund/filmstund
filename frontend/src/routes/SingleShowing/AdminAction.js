import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

import MainButton, { GrayButton, RedButton } from "../../MainButton";
import BuyModal from "./BuyModal";
import gql from "graphql-tag";
import {
  markAsBought,
  deleteShowing,
  togglePaidChange
} from "../../fragments/showings";
import { compose } from "react-apollo";
import { navigateToEditShowing } from "../../navigators/index";
import { addTickets } from "../../fragments/tickets";

class AdminAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adminMessage: null,
      ticketPrice: props.showing.price / 100,
      cinemaTicketUrls: [],
      buyData: null,
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

  handleStartBooking = () => {
    this.setState({
      showModal: true,
      errors: null
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
      .then(this.handleStartBooking)
      .catch(errors => {
        this.setState({ errors });
      });
  };

  handleDelete = () => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");

    if (proceed) {
      this.props.deleteShowing().then(() => {
        this.props.history.push("/showings");
      });
    }
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
      adminMessage
    } = this.state;

    return (
      <React.Fragment>
        {showModal && (
          <BuyModal
            errors={errors}
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
        {!ticketsBought && (
          <GrayButton onClick={this.handleEdit}>Ändra besök</GrayButton>
        )}
        <RedButton onClick={this.handleDelete}>Ta bort besök</RedButton>
      </React.Fragment>
    );
  }
}

AdminAction.propTypes = {
  showing: PropTypes.object.isRequired
};

export const showingAdminFragment = gql`
  fragment ShowingAdmin on Showing {
    sfScreen {
      sfId
      name
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
`;

export default compose(
  withRouter,
  markAsBought,
  deleteShowing,
  addTickets,
  togglePaidChange
)(AdminAction);
