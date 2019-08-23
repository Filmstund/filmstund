import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { graphql } from "react-apollo";
import { branch, compose, renderComponent } from "recompose";

import { usePromoteToAdmin } from "../../../apollo/mutations/showings/usePromoteToAdmin";
import { navigateToShowingTickets } from "../../common/navigators";
import { MissingShowing } from "../../common/showing/MissingShowing";
import Showing, { oldShowingFragment } from "../../common/showing/Showing";
import IMDbLink from "../../common/ui/IMDbLink";
import { ButtonContainer } from "../../common/ui/MainButton";
import { PageWidthWrapper } from "../../common/ui/PageWidthWrapper";
import Loader from "../../common/utils/ProjectorLoader";
import { useScrollToTop } from "../../common/utils/useScrollToTop";
import AdminAction from "../AdminAction";
import ParticipantList from "../components/ParticipantsList";
import SwishModal from "../components/SwishModal";
import { userIsAdmin, userIsParticipating } from "../utils/utils";
import ShowingPaymentContainer from "./ShowingPaymentContainer";

const SingleShowingContainer = ({
  data: { me, showing, refetch },
  history
}) => {
  const [openModal, setOpenModal] = useState(false);

  const promoteToAdmin = usePromoteToAdmin();

  useScrollToTop();

  const navigateToTickets = useCallback(() => {
    navigateToShowingTickets(history, showing);
  }, [history, showing]);

  const openSwish = useCallback(swishLink => {
    setOpenModal(true);
    if (swishLink) {
      window.location = swishLink;
    }
  }, []);

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
    ${oldShowingFragment}
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
  isLoading,
  is404
)(SingleShowingContainer);
