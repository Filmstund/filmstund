import React, { Component } from "react";
import { connect } from "react-redux";
import {
  showings as showingActions,
  users as userActions
} from "../../store/reducers";

import withLoader from "../../lib/withLoader";
import { getJson } from "../../lib/fetch";

import Showing, { getStatus } from "../../Showing";
import BoughtShowing from "./BoughtShowing";
import PendingShowing from "./PendingShowing";
import AdminAction from "./AdminAction";
import ParticipantList from "./ParticipantsList";
import SwishModal from "./SwishModal";

class Showings extends Component {
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
    return showing.participants.includes(me.id);
  };

  renderBoughtOrPendingShowing = () => {
    const { showing, me } = this.props;

    if (showing.ticketsBought) {
      if(showing.participants.includes(me.id)) {
        return <BoughtShowing showing={showing} openSwish={this.openSwish} />;
      } else {
        return <ParticipantList participants={showing.participants} />
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
        {this.renderBoughtOrPendingShowing()}
        {isAdmin && <AdminAction showing={showing} loading={loading} />}
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
