import React, { Component } from "react";
import { connect } from "react-redux";
import {
  showings as showingActions,
  users as userActions
} from "../store/reducers";

import withLoader from "../lib/withLoader";
import { getJson, jsonRequest } from "../lib/fetch";
import { withBaseURL } from "../lib/withBaseURL";

import Showing from "../Showing";
import QRCode from "../QRCode";
import Loader from "../ProjectorLoader";
import BoughtShowing from "../BoughtShowing";
import PendingShowing from "../PendingShowing";
import AdminAction from "../AdminAction";
import BuyModal from "../BuyModal";
import Modal from "../Modal";

const oreToKr = price => {
  if (price === null) {
    return 0;
  } else {
    return Math.ceil(price / 100);
  }
};

class Showings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ticketPrice: oreToKr(props.showing.price),
      buyData: null,
      payData: null,
      showModal: false
    };
  }

  componentWillMount() {
    if (this.props.showing.ticketsBought) {
      this.requestPaymentInfo();
    }
  }

  handleDelete = () => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");

    if (proceed) {
      this.props.dispatch(
        showingActions.actions.requestDelete(this.props.showingId)
      );
    }
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

  handleCreateGoogleEvent = () => {
    const { showing } = this.props;

    this.setState({
      isCreatingEvent: true
    });

    jsonRequest(
      withBaseURL(`/showings/${showing.id}/invite/googlecalendar`),
      showing.participants
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

  requestPaymentInfo = () => {
    if (!this.isParticipating()) return;

    const { showing } = this.props;

    getJson(`/showings/${showing.id}/pay`).then(payData => {
      this.setState({
        payData
      });
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

  setPrice = price => {
    const int = parseInt(price, 10);

    this.setState({
      ticketPrice: isNaN(int) ? 0 : int
    });
  };

  handleMarkBought = event => {
    event.preventDefault();

    this.props.dispatch(
      showingActions.actions.requestUpdate({
        ...this.props.showing,
        price: this.state.ticketPrice * 100,
        ticketsBought: true
      })
    );
    setTimeout(() => {
      this.handleStartBooking();
    }, 2000);
  };

  renderSwishModal = () => {
    const { payData } = this.state;
    if (!payData) {
      return <Loader />;
    }
    // const { amountOwed, swishLink, hasPaid, payTo } = payData
    const { swishLink } = payData;

    if (swishLink) {
      return (
        <Modal>
          <button onClick={() => this.setState({ swish: false })}>Stäng</button>
          <QRCode value={swishLink} width={200} height={200} />
        </Modal>
      );
    }
  };

  openSwish = swishLink => {
    this.setState({ swish: true });
    window.location = swishLink;
  };

  isParticipating = () => {
    const { showing, me } = this.props;
    return showing.participants.includes(me.id);
  };

  render() {
    const { className, showing, me, loading } = this.props;
    const {
      ticketPrice,
      swish,
      showModal,
      buyData,
      isCreatingEvent,
      adminMessage
    } = this.state;

    const isAdmin = showing.admin === me.id;

    return (
      <div className={className}>
        {swish && this.renderSwishModal()}
        {showModal &&
          <BuyModal
            setPrice={this.setPrice}
            loading={loading}
            showing={showing}
            handleMarkBought={this.handleMarkBought}
            handlePaidChange={this.handlePaidChange}
            ticketPrice={ticketPrice}
            buyData={buyData}
            closeModal={() =>
              this.setState({ showModal: false, buyData: null })}
          />}
        <Showing
          movieId={showing.movieId}
          date={showing.date}
          adminId={showing.admin}
          location={showing.location.name}
        />
        {!showing.ticketsBought &&
          <PendingShowing
            showing={showing}
            isParticipating={this.isParticipating()}
          />}
        {showing.ticketsBought &&
          <BoughtShowing showing={showing} openSwish={this.openSwish} />}
        {isAdmin &&
          <AdminAction
            isCreatingEvent={isCreatingEvent}
            adminMessage={adminMessage}
            handleDelete={this.handleDelete}
            handleStartBooking={this.handleStartBooking}
            handleCreateGoogleEvent={this.handleCreateGoogleEvent}
            ticketsBought={showing.ticketsBought}
          />}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { showingId } = props.match.params;
  const showing = state.showings.data[showingId];
  const adminId = showing && showing.admin;

  return {
    showingId,
    adminId,
    isCreatingEvent: false,
    adminMessage: null,
    loading: state.showings.loading,
    showing: { ...state.showings, data: showing },
    admin: { ...state.users, data: state.users.data[adminId] },
    me: state.me.data
  };
};

export default connect(mapStateToProps)(
  withLoader({
    showing: ["showingId", showingActions.actions.requestSingle],
    admin: ["adminId", userActions.actions.requestSingle]
  })(Showings)
);
