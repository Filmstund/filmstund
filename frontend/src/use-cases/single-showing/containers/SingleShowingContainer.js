import React, { useCallback, useState } from "react";

import { branch, compose, renderComponent } from "recompose";

import Showing, { showingFragment } from "../../common/showing/Showing";
import { ButtonContainer } from "../../common/ui/MainButton";
import AdminAction from "../AdminAction";
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
import { MissingShowing } from "../../common/showing/MissingShowing";

const SingleShowingContainer = ({
  promoteToAdmin,
  data: { me, showing, refetch },
  history
}) => {
  const [openModal, setOpenModal] = useState(false);

  const navigateToTickets = useCallback(() => {
    navigateToShowingTickets(history, showing);
  });

  const openSwish = useCallback(swishLink => {
    setOpenModal(true);
    if (swishLink) {
      window.location = swishLink;
    }
  });

  const isAdmin = userIsAdmin(showing, me);
  const isParticipating = userIsParticipating(showing.participants, me);

  const { attendeePaymentDetails } = showing;

  return (
    <PageWidthWrapper>
      {openModal && (
        <SwishModal
          attendeePaymentDetails={attendeePaymentDetails}
          closeSwish={() => setOpenModal(false)}
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
        {isAdmin && (
          <AdminAction onBeforeOpenBuyModal={refetch} showing={showing} />
        )}
        <ShowingPaymentContainer
          showing={showing}
          isAdmin={isAdmin}
          foretagsbiljetter={me.foretagsbiljetter}
          isParticipating={isParticipating}
          onClickTickets={navigateToTickets}
          openSwish={openSwish}
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
};

const data = graphql(
  gql`
    query SingleShowing($webId: Base64ID!) {
      me: currentUser {
        ...PendingShowing
        id
      }
      showing(webId: $webId) {
        ...OldShowing
        ...ShowingAdmin
        ...BoughtShowing
        webId
        slug
        price
        private
        movie {
          imdbId
        }
        participants {
          ...ParticipantsList
        }
      }
    }
    ${ShowingPaymentContainer.fragments.showing}
    ${ShowingPaymentContainer.fragments.currentUser}
    ${showingFragment}
    ${AdminAction.fragments.showing}
    ${ParticipantList.fragments.participant}
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

const is404 = branch(
  ({ data: { showing } }) => !showing,
  renderComponent(MissingShowing)
);

export default compose(
  data,
  promoteToAdmin,
  isLoading,
  is404
)(SingleShowingContainer);
