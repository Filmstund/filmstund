import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import { compose, withProps } from "recompose";

import { getJson } from "../../lib/fetch";
import { ftgTickets as ftgTicketsActions } from "../../store/reducers";

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
    } else {
      this.props.requestTickets();
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

  navigateToTickets = () => {
    const { showing } = this.props;

    this.props.history.push(`/showings/${showing.id}/tickets`)
  };

  renderBoughtOrPendingShowing = () => {
    const { showing } = this.props;
    const { payData } = this.state;

    if (showing.ticketsBought) {
      if (this.isParticipating()) {
        return (
          <BoughtShowing
            showing={showing}
            onClickTickets={this.navigateToTickets}
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
        {swish && (
          <SwishModal
            payData={payData}
            closeSwish={() => this.setState({ swish: false })}
          />
        )}
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
  connect(null, {
    requestTickets: ftgTicketsActions.actions.requestSingle
  }),
  withRouter,
  withProps(routerParamsToShowingId),
  withShowingRouteLoader
)(SingleShowing);
