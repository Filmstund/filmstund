import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { showings as showingActions } from "../../store/reducers";

import { getJson, jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";

import MainButton, {
  GrayButton,
  RedButton
} from "../../MainButton";
import BuyModal from "./BuyModal";

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
      sfTicketLink: "",
      buyData: null,
      showModal: false
    };
  }

  setPrice = price => {
    const int = parseInt(price, 10);

    this.setState({
      ticketPrice: isNaN(int) ? 0 : int
    });
  };

  setTicketLink = sfTicketLink => {
    this.setState({
      sfTicketLink
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
    const { sfTicketLink, ticketPrice } = this.state;

    this.props
      .requestUpdate({
        ...showing,
        sfTicketLink,
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

  render() {
    const { showing } = this.props;

    const { ticketsBought, calendarEventId } = showing;

    const {
      isCreatingEvent,
      ticketPrice,
      sfTicketLink,
      showModal,
      buyData,
      adminMessage
    } = this.state;

    return [
      showModal &&
      <BuyModal
        key="buymodal"
        setPrice={this.setPrice}
        setTicketLink={this.setTicketLink}
        showing={showing}
        handleMarkBought={this.handleMarkBought}
        handlePaidChange={this.handlePaidChange}
        ticketPrice={ticketPrice}
        ticketLink={sfTicketLink}
        buyData={buyData}
        closeModal={() =>
          this.setState({ showModal: false, buyData: null })}
      />,
      adminMessage &&
      <div key="admMessage">
        {adminMessage}
      </div>,

      ticketsBought
        ? <GrayButton key="betalningsstatus" onClick={this.handleStartBooking}>
          Visa betalningsstatus
            </GrayButton>
        : <MainButton key="allaarmed" onClick={this.handleStartBooking}>
          Alla är med, nu bokar vi!
            </MainButton>,
      ticketsBought &&
      calendarEventId === null &&
      <MainButton
        key="googlecal"
        disabled={isCreatingEvent}
        onClick={this.handleCreateGoogleEvent}
      >
        Skapa Googlekalenderevent
          </MainButton>,
      <RedButton key="deleteshowing" onClick={this.handleDelete}>Ta bort besök</RedButton>

    ];
  }
}

AdminAction.propTypes = {
  showing: PropTypes.object.isRequired
};

const mapDispatchToProps = (dispatch, props) => {
  const { requestUpdate, requestDelete } = showingActions.actions;
  const { showing } = props;

  return {
    requestUpdate: obj => dispatch(requestUpdate(obj)),
    requestDelete: () => dispatch(requestDelete(showing.id))
  };
};

export default connect(null, mapDispatchToProps)(AdminAction);
