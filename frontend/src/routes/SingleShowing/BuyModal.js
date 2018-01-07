import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Modal from "../../Modal";
import Field from "../../Field";
import Input from "../../Input";
import Header, { SmallHeader } from "../../Header";
import CopyValue from "../../CopyValue";
import Center from "../../Center";
import Loader from "../../ProjectorLoader";
import TicketURLInput from "../../TicketURLInput";
import PaymentParticipantsList from "./PaymentParticipantsList";
import ParticipantsList from "./ParticipantsList";

import MainButton from "../../MainButton";

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
      <UserTooltip userId={ticket.userId} ticket={ticket}>
        <CopyValue key={ticket.foretagsbiljett} text={ticket.foretagsbiljett} />
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

const SfMembershipList = ({ sfData, participants }) => (
  <div>
    <SmallHeader>SF medlemsnummer</SmallHeader>
    {sfData
      .filter(({ sfMembershipId }) => sfMembershipId !== null)
      .map(({ user, sfMembershipId }) => (
        <UserTooltip user={user} key={user.id}>
          <CopyValue text={sfMembershipId} />
        </UserTooltip>
      ))}
    <hr />
    {renderUsersWithoutSfMembershipIds(sfData)}
  </div>
);

const BuyModal = ({
  ticketPrice,
  cinemaTicketUrls,
  setPrice,
  setCinemaTicketUrls,
  preBuyInfo,
  handleMarkBought,
  handlePaidChange,
  closeModal,
  showing
}) => {
  if (!preBuyInfo) {
    return (
      <Modal>
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  const { sfBuyLink, sfData, paymentInfo } = preBuyInfo;
  const { ticketsBought } = showing;

  const participantsWithForetagsbiljett = sfData.filter(
    ({ foretagsbiljett }) => foretagsbiljett !== null
  );

  return (
    <Modal>
      <Padding>
        <Close onClick={closeModal}>
          <i className="fa fa-times" aria-hidden="true" />
        </Close>
        <Padding>
          {ticketsBought && (
            <PaymentParticipantsList
              handlePaidChange={handlePaidChange}
              participants={paymentInfo}
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
              <SfMembershipList
                sfData={sfData}
                participants={showing.participants}
              />
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
