import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Modal from "../../use-cases/common/ui/Modal";
import Field from "../../use-cases/common/ui/Field";
import Input from "../../use-cases/common/ui/Input";
import Header, { SmallHeader } from "../../use-cases/common/ui/Header";
import CopyValue from "../../use-cases/common/utils/CopyValue";
import Center from "../../use-cases/common/ui/Center";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import PaymentParticipantsList from "./components/PaymentParticipantsList";
import ParticipantsList from "./components/ParticipantsList";

import MainButton from "../../use-cases/common/ui/MainButton";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";

const Padding = styled.div`
  padding: 0 1em;
`;

const Close = styled.div`
  position: absolute;
  display: inline;
  font-size: 2em;
  right: 1em;
  top: 0.8em;
  cursor: pointer;
`;

const UserTooltip = ({ user, children }) => (
  <div title={`${user.firstName} '${user.nick}' ${user.lastName}`}>
    {children}
  </div>
);

const ForetagsBiljetterList = ({ tickets }) => (
  <div>
    <SmallHeader>Företagsbiljetter</SmallHeader>
    {tickets.map(ticket => (
      <UserTooltip key={ticket.user.id} user={ticket.user} ticket={ticket}>
        <CopyValue
          useStricken
          key={ticket.foretagsbiljett}
          text={ticket.foretagsbiljett}
        />
      </UserTooltip>
    ))}
  </div>
);

const UserItem = ({ user }) => (
  <li>
    {user.firstName} '{user.nick}' {user.lastName}
  </li>
);

const renderUsersWithoutSfMembershipIds = sfData => {
  const usersWithoutSfMembershipIds = sfData
    .filter(({ sfMembershipId }) => sfMembershipId === null)
    .map(({ user }) => user);

  if (usersWithoutSfMembershipIds.length > 0) {
    return (
      <div>
        {usersWithoutSfMembershipIds.length} deltagare saknar SF medlemsnummer:
        <ul>
          {usersWithoutSfMembershipIds.map(user => (
            <UserItem key={user.id} user={user} />
          ))}
        </ul>
      </div>
    );
  } else {
    return null;
  }
};

const SfMembershipList = ({ sfData }) => (
  <div>
    <SmallHeader>SF medlemsnummer</SmallHeader>
    {sfData
      .filter(({ sfMembershipId }) => sfMembershipId !== null)
      .map(({ user, sfMembershipId }) => (
        <UserTooltip user={user} key={user.id}>
          <CopyValue useStricken text={sfMembershipId} />
        </UserTooltip>
      ))}
    <hr />
    {renderUsersWithoutSfMembershipIds(sfData)}
  </div>
);

const BuyModal = ({
  loading,
  errors,
  ticketPrice,
  cinemaTicketUrls,
  setPrice,
  setCinemaTicketUrls,
  adminPaymentDetails,
  handleMarkBought,
  handlePaidChange,
  closeModal,
  showing
}) => {
  if (loading || !adminPaymentDetails) {
    return (
      <Modal>
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  const { sfBuyLink, sfData, participantPaymentInfos } = adminPaymentDetails;
  const { ticketsBought } = showing;

  const participantsWithForetagsbiljett = sfData.filter(
    ({ foretagsbiljett }) => foretagsbiljett !== null
  );

  return (
    <Modal>
      <Padding>
        <Close onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Close>
        <Padding>
          {ticketsBought && (
            <PaymentParticipantsList
              handlePaidChange={handlePaidChange}
              participants={participantPaymentInfos}
            />
          )}
          {!ticketsBought && (
            <form onSubmit={handleMarkBought}>
              <Header>Boka</Header>
              {!sfBuyLink &&
                "Ingen köplänk genererad ännu! Kom tillbaka senare!"}
              {sfBuyLink && (
                <a href={sfBuyLink} target="_blank" rel="noopener noreferrer">
                  Öppna SF länk i nytt fönster
                </a>
              )}
              <ParticipantsList
                participants={showing.participants}
                showPhone={true}
              />
              <ForetagsBiljetterList
                tickets={participantsWithForetagsbiljett}
              />
              <SfMembershipList sfData={sfData} />
              <StatusMessageBox errors={errors} />
              <Field text="Biljettpris:">
                <Input
                  type="number"
                  value={ticketPrice}
                  min={0}
                  onChange={event => setPrice(event.target.value)}
                />
              </Field>
              <Field text="SF-biljettlänkar: (en per rad)">
                <TicketURLInput
                  cinemaTicketUrls={cinemaTicketUrls}
                  onChange={setCinemaTicketUrls}
                />
              </Field>
              <MainButton>Markera som bokad</MainButton>
            </form>
          )}
        </Padding>
      </Padding>
    </Modal>
  );
};

BuyModal.propTypes = {
  showing: PropTypes.object.isRequired,
  setPrice: PropTypes.func.isRequired,
  buyData: PropTypes.object,
  handleMarkBought: PropTypes.func.isRequired,
  handlePaidChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default BuyModal;
