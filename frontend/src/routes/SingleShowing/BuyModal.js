import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { sum } from "lodash";

import Modal from "./Modal";
import Field from "../../Field";
import Input from "../../Input";
import Header, { SmallHeader } from "../../Header";
import CopyValue from "../../CopyValue";
import Center from "../../Center";
import Loader from "../../ProjectorLoader";
import PaymentParticipantsList from "./PaymentParticipantsList";
import buildUserComponent from "./UserComponentBuilder";
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

const ForetagsBiljetterList = ({ participants }) =>
  <div>
    <SmallHeader>Företagsbiljetter</SmallHeader>
    {participants.map(p =>
      <CopyValue key={p.payment.extra} text={p.payment.extra} />
    )}
  </div>;

const sumBioklubbkortsnummer = nummer =>
  sum(nummer
    .map(nbr => nbr.bioklubbnummer)
    .map(nbr => parseInt(nbr === null ? 0 : nbr, 10)));

const UserItem = buildUserComponent(({ user }) =>
  <li>{user.firstName} '{user.nick}' {user.lastName}</li>
);

const usersWithoutBioklubbnummer = ({bioklubbnummer}) =>
  bioklubbnummer
  .filter(nbr => nbr.bioklubbnummer === null)
  .map(nbr => nbr.user)
  .map(user => <UserItem key={user} userId={user}/> );

const BioklubbkortsnummerList = ({ bioklubbnummer, participants }) =>
  <div>
    <SmallHeader>Bioklubbnummer</SmallHeader>
    {bioklubbnummer.map(nbr => <div key={nbr.user}><CopyValue text={nbr.bioklubbnummer} /></div>)}
    <hr />
    = {sumBioklubbkortsnummer(bioklubbnummer)}
    {usersWithoutBioklubbnummer(bioklubbnummer).length !== participants.length
    && <div>{usersWithoutBioklubbnummer(bioklubbnummer).length} deltagare saknar bioklubbnummer: <ul>{usersWithoutBioklubbnummer(bioklubbnummer)}</ul></div>}
  </div>;

const BuyModal = ({
  ticketPrice,
  setPrice,
  loading,
  buyData,
  handleMarkBought,
  handlePaidChange,
  closeModal,
  showing
}) => {
  if (!buyData || loading) {
    return (
      <Modal>
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  const { participantInfo, sfBuyLink, bioklubbnummer, participants } = buyData;
  const { ticketsBought } = showing;

  const participantsWithForetagsbiljett = participants.filter(
    p => p.payment.type === "Företagsbiljett"
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
              <ParticipantsList participants={showing.participants} showPhone={true} />
              <ForetagsBiljetterList
                participants={participantsWithForetagsbiljett}
              />
              <BioklubbkortsnummerList
                bioklubbnummer={bioklubbnummer}
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
  loading: PropTypes.bool.isRequired,
  buyData: PropTypes.object,
  handleMarkBought: PropTypes.func.isRequired,
  handlePaidChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default BuyModal;
