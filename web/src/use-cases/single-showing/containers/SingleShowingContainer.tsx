import { ApolloError, gql, NetworkStatus, useQuery } from "@apollo/client";
import React, { useState } from "react";

import { usePromoteToAdmin } from "../../../apollo/mutations/showings/usePromoteToAdmin";
import { navigateToShowingTickets } from "../../common/navigators";
import { MissingShowing } from "../../common/showing/MissingShowing";
import Showing, { oldShowingFragment } from "../../common/showing/Showing";
import IMDbLink from "../../common/ui/IMDbLink";
import { ButtonContainer } from "../../common/ui/MainButton";
import Loader from "../../common/utils/ProjectorLoader";
import StatusMessageBox from "../../common/utils/StatusMessageBox";
import { useScrollToTop } from "../../common/utils/useScrollToTop";
import AdminAction, { adminActionFragments } from "../AdminAction";
import ParticipantList, {
  participantsListFragment,
} from "../components/ParticipantsList";
import { SwishModal } from "../components/SwishModal";
import { userIsAdmin, userIsParticipating } from "../utils/utils";
import {
  SingleShowing,
  SingleShowing_me,
  SingleShowing_showing,
  SingleShowingVariables,
} from "./__generated__/SingleShowing";
import ShowingPaymentContainer from "./ShowingPaymentContainer";
import { useNavigate } from "react-router-dom";

interface Props {
  me: SingleShowing_me;
  error: ApolloError | undefined;
  showing: SingleShowing_showing | null;
  refetch: () => Promise<unknown>;
}

const SingleShowingContainer: React.FC<Props> = ({
  me,
  showing,
  error,
  refetch,
}) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const promoteToAdmin = usePromoteToAdmin();

  useScrollToTop();

  const navigateToTickets = () => {
    if (showing) {
      navigateToShowingTickets(navigate, showing);
    }
  };

  const openSwish = (swishLink?: string) => {
    setOpenModal(true);
    if (swishLink) {
      window.location.href = swishLink;
    }
  };

  if (!showing) {
    return <MissingShowing />;
  }

  const isAdmin = userIsAdmin(showing, me);
  const isParticipating = userIsParticipating(showing.participants, me);

  const { attendeePaymentDetails } = showing;

  return (
    <>
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
      {error && <StatusMessageBox errors={error.graphQLErrors} />}
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
        onClickItem={(userId) => promoteToAdmin(showing.id, userId)}
      />
    </>
  );
};

const useSingleShowingData = (webId: string) =>
  useQuery<SingleShowing, SingleShowingVariables>(
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
      ${adminActionFragments}
      ${participantsListFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: { webId },
    }
  );

const SingleShowingLoader: React.FC<{ webId: string }> = ({ webId }) => {
  const { data, loading, error, refetch, networkStatus } =
    useSingleShowingData(webId);

  if (!data || (loading && networkStatus !== NetworkStatus.refetch)) {
    return <Loader />;
  }

  return (
    <SingleShowingContainer
      error={error}
      showing={data.showing}
      me={data.me}
      refetch={refetch}
    />
  );
};

export default SingleShowingLoader;
