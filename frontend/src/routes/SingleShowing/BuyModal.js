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
  sum(nummer.map(nbr => parseInt(nbr, 10)));

const BioklubbkortsnummerList = ({ bioklubbnummer, participants }) =>
  <div>
    <SmallHeader>Bioklubbnummer</SmallHeader>
    {bioklubbnummer.map(nbr => <CopyValue key={nbr} text={nbr} />)}
    <hr />
    = {sumBioklubbkortsnummer(bioklubbnummer)}
    {bioklubbnummer.length !== participants.length &&
      <div>
        {participants.length - bioklubbnummer.length} deltagare utan
        bioklubbkortsnummer
      </div>}
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

  const { participantInfo, bioklubbnummer, sfBuyLink, participants } = buyData;
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
              <ParticipantsList participants={showing.participants} />
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
