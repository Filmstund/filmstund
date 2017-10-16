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
import PaymentParticipantsList from "./PaymentParticipantsList";
import withUserLoader from "../../loaders/UserLoader";
import ParticipantsList from "./ParticipantsList";

import MainButton from "../../MainButton";

const Padding = styled.div`padding: 0 1em;`;

const Close = styled.div`
  position: absolute;
  display: inline;
  font-size: 2em;
  right: 1em;
  top: 0.8em;
  cursor: pointer;
`;

const UserTooltip = withUserLoader(({ user, children }) =>
  <div title={`${user.firstName} '${user.nick}' ${user.lastName}`}>
    {children}
  </div>);

const ForetagsBiljetterList = ({ tickets }) =>
  <div>
    <SmallHeader>Företagsbiljetter</SmallHeader>
    {tickets.map(ticket =>
      <UserTooltip userId={ticket.userId} ticket={ticket}>
        <CopyValue key={ticket.foretagsbiljett} text={ticket.foretagsbiljett} />
      </UserTooltip>
    )}
  </div>;

const UserItem = withUserLoader(({ user }) =>
  <li>
    {user.firstName} '{user.nick}' {user.lastName}
  </li>
);


const renderUsersWithoutSfMembershipIds = tickets => {
  const userIdsWithoutSfMembershipIds = tickets
    .filter(t => t.sfMembershipId === null)
    .map(t => t.userId);

  if (userIdsWithoutSfMembershipIds.length > 0) {
    return <div>
      {userIdsWithoutSfMembershipIds.length} deltagare saknar
      SF medlemsnummer:
      <ul>{userIdsWithoutSfMembershipIds.map(userId =>
        <UserItem key={userId} userId={userId} />
      )}</ul>
    </div>
  } else {
    return null;
  }
}

const SfMembershipListList = ({ tickets, participants }) =>
  <div>
    <SmallHeader>SF medlemsnummer</SmallHeader>
    {tickets
      .filter(t => t.sfMembershipId !== null)
      .map(t => <UserTooltip userId={t.userId}>
        <CopyValue key={t.userId} text={t.sfMembershipId} />
      </UserTooltip>)}
    <hr />
    {renderUsersWithoutSfMembershipIds(tickets)}
  </div>;

const BuyModal = ({
  ticketPrice,
  cinemaTicketUrls,
  setPrice,
  setCinemaTicketUrls,
  buyData,
  handleMarkBought,
  handlePaidChange,
  closeModal,
  showing
}) => {
  if (!buyData) {
    return (
      <Modal>
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  const { participantInfo, sfBuyLink, tickets } = buyData;
  const { ticketsBought, participants } = showing;

  const participantsWithForetagsbiljett = tickets.filter(
    user => user.foretagsbiljett !== null
  );

  return (
    <Modal>
      <Padding>
        <Close onClick={closeModal}>
          <i className="fa fa-times" aria-hidden="true" />
        </Close>
        <Padding>
          {ticketsBought &&
            <PaymentParticipantsList
              handlePaidChange={handlePaidChange}
              participants={participantInfo}
            />}
          {!ticketsBought &&
            <form onSubmit={handleMarkBought}>
              <Header>Boka</Header>
              {!sfBuyLink &&
                "Ingen köplänk genererad ännu! Kom tillbaka senare!"}
              {sfBuyLink &&
                <a href={sfBuyLink} target="_blank" rel="noopener noreferrer">
                  Öppna SF länk i nytt fönster
                </a>}
              <ParticipantsList
                participants={showing.participants}
                showPhone={true}
              />
              <ForetagsBiljetterList
                tickets={participantsWithForetagsbiljett}
              />
              <SfMembershipListList
                tickets={tickets}
                participants={participants}
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
                <textarea
                  cols={90}
                  rows={5}
                  value={cinemaTicketUrls.join('\n')}
                  onChange={event => setCinemaTicketUrls(event.target.value.split('\n'))}
                />
              </Field>
              <MainButton>Markera som bokad</MainButton>
            </form>}
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
