import React, { Component } from "react";

import { branch, compose, renderComponent } from "recompose";

import Showing, { showingFragment } from "../../common/showing/Showing";
import { ButtonContainer } from "../../common/ui/MainButton";
import BoughtShowing from "../BoughtShowing";
import AdminAction, { showingAdminFragment } from "../AdminAction";
import ParticipantList from "../components/ParticipantsList";
import SwishModal from "../components/SwishModal";
import IMDbLink from "../../common/ui/IMDbLink";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Loader from "../../common/utils/ProjectorLoader";
import { navigateToShowingTickets } from "../../common/navigators/index";
import { PageWidthWrapper } from "../../common/ui/PageWidthWrapper";
import { promoteToAdmin } from "../../../apollo/mutations/showings";
import { userIsAdmin, userIsParticipating } from "../utils/utils";
import ShowingPaymentContainer from "./ShowingPaymentContainer";

class SingleShowingContainer extends Component {
  state = {
    showModal: false
  };

  openSwish = swishLink => {
    this.setState({ swish: true });
    window.location = swishLink;
  };

  navigateToTickets = () => {
    const {
      history,
      data: { showing }
    } = this.props;

    navigateToShowingTickets(history, showing);
  };

  render() {
    const { swish } = this.state;
    const {
      promoteToAdmin,
      data: { me, showing }
    } = this.props;

    const isAdmin = userIsAdmin(showing, me);
    const isParticipating = userIsParticipating(showing.participants, me);

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
          {isAdmin && <AdminAction showing={showing} />}
          <ShowingPaymentContainer
            showing={showing}
            isAdmin={isAdmin}
            isParticipating={isParticipating}
            onClickTickets={this.navigateToTickets}
            openSwish={this.openSwish}
          />
        </ButtonContainer>
        <ParticipantList
          meId={me.id}
          isAdmin={isAdmin}
          participants={showing.participants}
          onClickItem={userId => promoteToAdmin(showing.id, userId)}
        />
      </PageWidthWrapper>
    );
  }
}

const data = graphql(
  gql`
    query SingleShowing($webId: Base64ID!) {
      me: currentUser {
        id
      }
      showing(webId: $webId) {
        ...OldShowing
        ...ShowingAdmin
        ...BoughtShowing
        price
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
      }
    }
    ${BoughtShowing.fragment.showing}
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
  data,
  promoteToAdmin,
  isLoading
)(SingleShowingContainer);
