import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

import { getJson, jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";

import MainButton, { GrayButton, RedButton } from "../../MainButton";
import BuyModal from "./BuyModal";
import gql from "graphql-tag";

const oreToKr = price => {
  if (price === null) {
    return 0;
  } else {
    return Math.ceil(price / 100);
  }
};

class AdminAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isCreatingEvent: false,
      adminMessage: null,
      ticketPrice: oreToKr(props.showing.price),
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
    const data = {
      ...info,
      hasPaid: !info.hasPaid
    };
    jsonRequest(withBaseURL("/participantinfo"), data, "PUT").then(newInfo => {
      this.setState({
        buyData: {
          ...this.state.buyData,
          participantInfo: this.state.buyData.participantInfo.map(info => {
            if (info.id === newInfo.id) {
              return newInfo;
            } else {
              return info;
            }
          })
        }
      });
    });
  };

  handleStartBooking = () => {
    const { showing } = this.props;
    this.setState({
      showModal: true
    });

    getJson(`/showings/${showing.id}/buy`).then(buyData => {
      this.setState({
        showModal: true,
        buyData
      });
    });
  };

  handleMarkBought = event => {
    event.preventDefault();

    const { showing } = this.props;
    const { cinemaTicketUrls, ticketPrice } = this.state;

    this.props
      .requestUpdate({
        id: showing.id,
        cinemaTicketUrls: cinemaTicketUrls.filter(
          line => line.trim().length !== 0
        ),
        price: ticketPrice * 100,
        ticketsBought: true
      })
      .then(this.handleStartBooking);
  };

  handleDelete = () => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");

    if (proceed) {
      this.props.requestDelete();
    }
  };

  handleCreateGoogleEvent = () => {
    const { showing } = this.props;

    this.setState({
      isCreatingEvent: true
    });

    jsonRequest(
      withBaseURL(`/showings/${showing.id}/invite/googlecalendar`),
      "" // Empty post
    )
      .then(resp => {
        this.setState({
          isCreatingEvent: false,
          adminMessage: "Kalenderevent skapat"
        });
      })
      .catch(err => {
        this.setState({
          isCreatingEvent: false,
          adminMessage: "Misslyckades med att skapa kalenderevent"
        });
      });
  };

  handleEdit = () => {
    const { showing } = this.props;
    this.props.history.push(`/showings/${showing.id}/edit`);
  };

  render() {
    const { showing } = this.props;

    const { ticketsBought, calendarEventId } = showing;

    const {
      isCreatingEvent,
      ticketPrice,
      cinemaTicketUrls,
      showModal,
      adminMessage
    } = this.state;

    return (
      <React.Fragment>
        {showModal && (
          <BuyModal
            setPrice={this.setPrice}
            setCinemaTicketUrls={this.setCinemaTicketUrls}
            showing={showing}
            handleMarkBought={this.handleMarkBought}
            handlePaidChange={this.handlePaidChange}
            ticketPrice={ticketPrice}
            cinemaTicketUrls={cinemaTicketUrls}
            preBuyInfo={showing.preBuyInfo}
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
        {ticketsBought &&
          calendarEventId === null && (
            <MainButton
              disabled={isCreatingEvent}
              onClick={this.handleCreateGoogleEvent}
            >
              Skapa Googlekalenderevent
            </MainButton>
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
    preBuyInfo {
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
      paymentInfo {
        user {
          phone
        }
      }
    }
  }
`;

// const mapDispatchToProps = (dispatch, props) => {
//   const { requestUpdate, requestDelete } = showingActions.actions;
//   const { showing } = props;

//   return {
//     requestUpdate: obj => dispatch(requestUpdate(obj)),
//     requestDelete: () => dispatch(requestDelete(showing.id))
//   };
// };

export default withRouter(AdminAction);
