import React, { useState } from "react";

import { navigateToShowingTickets } from "../../common/navigators";
import { MissingShowing } from "../../common/showing/MissingShowing";
import SimpleShowing from "../../common/showing/SimpleShowing";
import IMDbLink from "../../common/ui/IMDbLink";
import { ButtonContainer } from "../../common/ui/MainButton";
import { useScrollToTop } from "../../common/utils/useScrollToTop";
import AdminAction from "../AdminAction";
import ParticipantList from "../components/ParticipantsList";
import { SwishModal } from "../components/SwishModal";
import { userIsAdmin, userIsParticipating } from "../utils/utils";
import {
  SingleShowingQuery,
  SingleShowingQueryDocument,
  usePromoteToAdminMutation,
  useSingleShowingQuery,
} from "../../../__generated__/types";
import { ShowingPaymentContainer } from "./ShowingPaymentContainer";
import { useNavigate } from "react-router-dom";
import { urql } from "../../../store/urql";
import { SingleShowingScreenShowing } from "./types";

interface Props {
  me: SingleShowingQuery["me"];
  showing: SingleShowingScreenShowing;
  refetch: () => Promise<unknown>;
}

const SingleShowingContainer: React.FC<Props> = ({ me, showing, refetch }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const [, promoteToAdmin] = usePromoteToAdminMutation();

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
  const isParticipating = userIsParticipating(showing.attendees, me);

  const { attendeePaymentDetails } = showing;

  return (
    <>
      {openModal && (
        <SwishModal
          swishLink={attendeePaymentDetails?.swishLink}
          closeSwish={() => setOpenModal(false)}
        />
      )}
      <SimpleShowing
        setTitleTag={true}
        movie={showing.movie}
        date={showing.date + " " + showing.time}
        admin={showing.admin}
        location={showing.location}
        ticketsBought={showing.ticketsBought}
      />
      <ButtonContainer>
        <IMDbLink imdbId={showing.movie.imdbID} />
        {isAdmin && (
          <AdminAction onBeforeOpenBuyModal={refetch} showing={showing} />
        )}
        <ShowingPaymentContainer
          showing={showing}
          isAdmin={isAdmin}
          foretagsbiljetter={me.giftCertificates}
          isParticipating={isParticipating}
          onClickTickets={navigateToTickets}
          openSwish={openSwish}
        />
      </ButtonContainer>
      <ParticipantList
        meId={me.id}
        isAdmin={isAdmin}
        participants={showing.attendees}
        onClickItem={(userId) =>
          promoteToAdmin({ showingId: showing.id, userId })
        }
      />
    </>
  );
};

const SingleShowingLoader: React.FC<{ webID: string }> = ({ webID }) => {
  const [{ data, error }] = useSingleShowingQuery({
    variables: { webID },
  });
  const showing = data!.showing;
  const me = data!.me;

  if (!showing) {
    return <MissingShowing />;
  }

  return (
    <SingleShowingContainer
      showing={showing}
      me={me}
      refetch={() => {
        return urql
          .query(
            SingleShowingQueryDocument,
            { webID },
            { requestPolicy: "network-only" }
          )
          .toPromise();
      }}
    />
  );
};

export default SingleShowingLoader;
