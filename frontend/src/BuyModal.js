import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Modal from "./Modal";
import Field from "./Field";
import Input from "./Input";
import Header, { SmallHeader } from "./Header";
import CopyValue from "./CopyValue";
import Center from "./Center";
import Loader from "./ProjectorLoader";
import ParticipantsList from "./ParticipantsList";

import MainButton from "./MainButton";

const Padding = styled.div`padding: 1em;`;

const BuyModal = ({
  ticketPrice,
  showing,
  setPrice,
  loading,
  buyData,
  handleMarkBought,
  handlePaidChange,
  closeModal
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

  const { participantInfo, bioklubbnummer, sfBuyLink } = buyData;
  const { ticketsBought } = showing;

  return (
    <Modal>
      <Padding>
        <button onClick={closeModal}>Stäng</button>
        <Padding>
          {ticketsBought &&
            <ParticipantsList
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
              <SmallHeader>Bioklubbnummer</SmallHeader>
              {bioklubbnummer.map(nbr => <CopyValue key={nbr} text={nbr} />)}
              <hr />
              ={" "}
              {bioklubbnummer
                .map(nbr => parseInt(nbr, 10))
                .reduce((acc, nbr) => acc + nbr, 0)}
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
