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

class SingleShowing extends Component {
  state = {
    showModal: false
  };

  componentWillMount() {
    this.props.data.refetch();
  }

  openSwish = swishLink => {
    this.setState({ swish: true });
    window.location = swishLink;
  };

  isParticipating = () => {
    const { data: { showing, me } } = this.props;
    return showing.participants.some(p => p.user.id === me.id);
  };

  navigateToTickets = () => {
    const { data: { showing } } = this.props;

    this.props.history.push(`/showings/${showing.id}/tickets`);
  };

  renderBoughtOrPendingShowing = () => {
    const { data: { showing } } = this.props;

    if (showing.ticketsBought) {
      if (this.isParticipating()) {
        return (
          <BoughtShowing
            showing={showing}
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

  render() {
    const { swish } = this.state;
    const { className, data: { showing, me } } = this.props;

    const { attendeePaymentDetails } = showing;

    const isAdmin = showing.admin.id === me.id;

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

const data = graphql(
  gql`
    query SingleShowing($showingId: UUID!) {
      me: currentUser {
        id
      }
      showing(id: $showingId) {
        ...Showing
        ...ShowingAdmin
        price
        payToUser {
          id
        }
        calendarEventId
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
  { options: { errorPolicy: "ignore" } }
);

const Loader = branch(({ data: { me } }) => !me, renderComponent(() => null));

export default compose(
  withRouter,
  withProps(routerParamsToShowingId),
  data,
  Loader
)(SingleShowing);
