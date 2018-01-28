import React, { Component } from "react";
import { withRouter } from "react-router";

import { compose, withProps, branch, renderComponent } from "recompose";

import Showing, { showingFragment } from "../../Showing";
import { ButtonContainer } from "../../MainButton";
import BoughtShowing from "./BoughtShowing";
import PendingShowing from "./PendingShowing";
import AdminAction, { showingAdminFragment } from "./AdminAction";
import ParticipantList from "./ParticipantsList";
import SwishModal from "./SwishModal";
import IMDbLink from "../../IMDbLink";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Loader from "../../ProjectorLoader";
import { navigateToShowingTickets } from "../../navigators/index";

class SingleShowing extends Component {
  state = {
    showModal: false
  };

  openSwish = swishLink => {
    this.setState({ swish: true });
    window.location = swishLink;
  };

  isParticipating = () => {
    const { data: { showing, me } } = this.props;
    return showing.participants.some(p => p.user.id === me.id);
  };

  navigateToTickets = () => {
    const { history, data: { showing } } = this.props;

    navigateToShowingTickets(history, showing);
  };

  renderBoughtOrPendingShowing = () => {
    const { data: { showing } } = this.props;

    if (showing.ticketsBought) {
      if (this.isParticipating()) {
        return (
          <BoughtShowing
            showing={showing}
            isAdmin={this.isAdmin()}
            onClickTickets={this.navigateToTickets}
            openSwish={this.openSwish}
            attendeePaymentDetails={showing.attendeePaymentDetails}
          />
        );
      }
    } else {
      return (
        <PendingShowing
          showingId={showing.id}
          isParticipating={this.isParticipating()}
        />
      );
    }
  };

  isAdmin = () => {
    const { data: { showing, me } } = this.props;

    return showing.admin.id === me.id;
  };

  render() {
    const { swish } = this.state;
    const { className, data: { showing } } = this.props;

    const { attendeePaymentDetails } = showing;

    return (
      <div className={className}>
        {swish && (
          <SwishModal
            attendeePaymentDetails={attendeePaymentDetails}
            closeSwish={() => this.setState({ swish: false })}
          />
        )}
        <Showing
          setTitleTag={true}
          movie={showing.movie}
          date={showing.date + " " + showing.time}
          admin={showing.admin}
          location={showing.location.name}
          ticketsBought={showing.ticketsBought}
        />
        <ButtonContainer>
          <IMDbLink imdbId={showing.movie.imdbId} />
          {this.isAdmin() && <AdminAction showing={showing} />}
          {this.renderBoughtOrPendingShowing()}
        </ButtonContainer>
        <ParticipantList participants={showing.participants} />
      </div>
    );
  }
}

const routerParamsToShowingId = ({ match }) => {
  const { webId } = match.params;

  return { webId };
};

const data = graphql(
  gql`
    query SingleShowing($webId: Base64ID!) {
      me: currentUser {
        id
      }
      showing(webId: $webId) {
        ...Showing
        ...ShowingAdmin
        price
        payToUser {
          id
        }
        private
        movie {
          imdbId
        }
        participants {
          user {
            id
            nick
            firstName
            lastName
            phone
            avatar
          }
        }
        myTickets {
          id
        }
        attendeePaymentDetails {
          payTo {
            id
            nick
            firstName
            lastName
            phone
          }
          swishLink
          hasPaid
          amountOwed
        }
      }
    }
    ${showingFragment}
    ${showingAdminFragment}
  `,
  { options: { errorPolicy: "ignore", fetchPolicy: "cache-and-network" } }
);

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(
  withRouter,
  withProps(routerParamsToShowingId),
  data,
  isLoading
)(SingleShowing);
