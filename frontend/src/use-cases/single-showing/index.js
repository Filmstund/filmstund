import React, { Component } from "react";
import { withRouter } from "react-router";

import { compose, withProps, branch, renderComponent } from "recompose";

import Showing, {
  showingFragment
} from "../../use-cases/common/showing/Showing";
import { ButtonContainer } from "../../use-cases/common/ui/MainButton";
import BoughtShowing from "./BoughtShowing";
import PendingShowing from "./PendingShowing";
import AdminAction, { showingAdminFragment } from "./AdminAction";
import ParticipantList from "./ParticipantsList";
import SwishModal from "./SwishModal";
import IMDbLink from "../../use-cases/common/ui/IMDbLink";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import { navigateToShowingTickets } from "../common/navigators/index";
import { PageWidthWrapper } from "../../use-cases/common/ui/PageWidthWrapper";
import { promoteToAdmin } from "../../apollo/mutations/showings";

class SingleShowing extends Component {
  state = {
    showModal: false
  };

  openSwish = swishLink => {
    this.setState({ swish: true });
    window.location = swishLink;
  };

  isParticipating = () => {
    const {
      data: { showing, me }
    } = this.props;
    return showing.participants.some(p => p.user.id === me.id);
  };

  navigateToTickets = () => {
    const {
      history,
      data: { showing }
    } = this.props;

    navigateToShowingTickets(history, showing);
  };

  renderBoughtOrPendingShowing = () => {
    const {
      data: { showing }
    } = this.props;

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
    const {
      data: { showing, me }
    } = this.props;

    return showing.admin.id === me.id;
  };

  render() {
    const { swish } = this.state;
    const {
      promoteToAdmin,
      data: { me, showing }
    } = this.props;

    const { attendeePaymentDetails } = showing;

    return (
      <PageWidthWrapper>
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
        <ParticipantList
          meId={me.id}
          isAdmin={this.isAdmin()}
          participants={showing.participants}
          onClickItem={userId => promoteToAdmin(showing.id, userId)}
        />
      </PageWidthWrapper>
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
        ...OldShowing
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
  {
    options: ({ webId }) => ({
      errorPolicy: "ignore",
      fetchPolicy: "cache-and-network",
      variables: { webId }
    })
  }
);

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(
  withRouter,
  withProps(routerParamsToShowingId),
  data,
  promoteToAdmin,
  isLoading
)(SingleShowing);
