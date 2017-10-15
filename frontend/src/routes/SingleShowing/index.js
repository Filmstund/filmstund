import React, { Component } from "react";

import { compose, withProps } from "recompose";

import { getJson } from "../../lib/fetch";

import withShowingRouteLoader from "../../loaders/ShowingRouteLoader";
import Showing from "../../Showing";
import { ButtonContainer } from "../../MainButton";
import BoughtShowing from "./BoughtShowing";
import PendingShowing from "./PendingShowing";
import AdminAction from "./AdminAction";
import ParticipantList from "./ParticipantsList";
import SwishModal from "./SwishModal";

class SingleShowing extends Component {
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
    const { className, showing, me } = this.props;
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
          ticketsBought={showing.ticketsBought}
        />
        <ButtonContainer>
          {isAdmin && <AdminAction showing={showing} />}
          {this.renderBoughtOrPendingShowing()}
        </ButtonContainer>
        <ParticipantList participants={showing.participants} />
      </div>
    );
  }
}

const routerParamsToShowingId = ({ match }) => {
  const { showingId } = match.params;

  return { showingId };
};

export default compose(
  withProps(routerParamsToShowingId),
  withShowingRouteLoader
)(SingleShowing);
