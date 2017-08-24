import React, { Component } from "react";

import { getJson } from "../../lib/fetch";

import Showing, { getStatus } from "../../Showing";
import BoughtShowing from "./BoughtShowing";
import PendingShowing from "./PendingShowing";
import AdminAction from "./AdminAction";
import ParticipantList from "./ParticipantsList";
import SwishModal from "./SwishModal";

export default class SingleShowing extends Component {
  state = {
    payData: null,
    showModal: false
  };

  componentWillMount() {
    if (this.props.showing.ticketsBought) {
      this.requestPaymentInfo();
    }
  }

  requestPaymentInfo = () => {
    if (!this.isParticipating()) return;

    const { showing } = this.props;

    getJson(`/showings/${showing.id}/pay`).then(payData => {
      this.setState({
        payData
      });
    });
  };

  openSwish = swishLink => {
    this.setState({ swish: true });
    window.location = swishLink;
  };

  isParticipating = () => {
    const { showing, me } = this.props;
    return showing.participants.some(p => p.userId === me.id);
  };

  renderBoughtOrPendingShowing = () => {
    const { showing } = this.props;
    const { payData } = this.state;

    if (showing.ticketsBought) {
      if (this.isParticipating()) {
        return (
          <BoughtShowing
            showing={showing}
            openSwish={this.openSwish}
            payData={payData}
          />
        );
      } else {
        return <ParticipantList participants={showing.participants} />;
      }
    } else {
      return (
        <PendingShowing
          showing={showing}
          isParticipating={this.isParticipating()}
        />
      );
    }
  };

  render() {
    const { className, showing, me, loading } = this.props;
    const { swish, payData } = this.state;

    const isAdmin = showing.admin === me.id;

    return (
      <div className={className}>
        {swish &&
          <SwishModal
            payData={payData}
            closeSwish={() => this.setState({ swish: false })}
          />}
        <Showing
          setTitleTag={true}
          movieId={showing.movieId}
          date={showing.date}
          adminId={showing.admin}
          location={showing.location.name}
          status={getStatus(showing)}
        />
        {isAdmin && <AdminAction showing={showing} loading={loading} />}
        {this.renderBoughtOrPendingShowing()}
      </div>
    );
  }
}
