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

const ForetagsBiljetterList = ({ tickets }) =>
  <div>
    <SmallHeader>Företagsbiljetter</SmallHeader>
    {tickets.map(t =>
      <CopyValue key={t.foretagsbiljett} text={t.foretagsbiljett} />
    )}
  </div>;

const UserItem = withUserLoader(({ user }) =>
  <li>
    {user.firstName} '{user.nick}' {user.lastName}
  </li>
);

const usersWithoutSfMembershipIds = tickets => {
  return tickets
    .filter(t => t.sfMembershipId === null)
    .map(t => t.userId)
    .map(userId => <UserItem key={userId} userId={userId} />);
};

const SfMembershipListList = ({ tickets, participants }) =>
  <div>
    <SmallHeader>SF medlemsnummer</SmallHeader>
    {tickets
      .filter(t => t.sfMembershipId !== null)
      .map(t => <CopyValue key={t.userId} text={t.sfMembershipId} />)}
    <hr />
    {usersWithoutSfMembershipIds(tickets).length !== participants.length &&
      <div>
        {usersWithoutSfMembershipIds(tickets).length} deltagare saknar
        SF medlemsnummer:
        <ul>{usersWithoutSfMembershipIds(tickets)}</ul>
      </div>}
  </div>;

const BuyModal = ({
  ticketPrice,
  ticketLink,
  setPrice,
  setTicketLink,
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
              <Field text="Biljettlänk:">
                <Input
                  value={ticketLink}
                  onChange={event => setTicketLink(event.target.value)}
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
  ticketPrice: PropTypes.number.isRequired,
  showing: PropTypes.object.isRequired,
  setPrice: PropTypes.func.isRequired,
  buyData: PropTypes.object,
  handleMarkBought: PropTypes.func.isRequired,
  handlePaidChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default BuyModal;
