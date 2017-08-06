import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

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
  
`

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

  const { participantInfo, sfBuyLink, bioklubbnummer } = buyData;
  const { ticketsBought } = showing;

  const UserItem = buildUserComponent(({ user }) =>
      <li>{user.firstName} '{user.nick}' {user.lastName}</li>
  );

  const usersWithoutBioklubbnummer = bioklubbnummer
      .filter(nbr => nbr.bioklubbnummer === null)
      .map(nbr => nbr.user)
      .map(user => <UserItem key={user} userId={user}/> );

  const renderBioklubbkortsnummer = () => {
    return (<div><SmallHeader>Bioklubbnummer</SmallHeader>
        {bioklubbnummer.map(nbr => <div key={nbr.user}><CopyValue text={nbr.bioklubbnummer} /></div>)}
    <hr />
      ={" "}
    {bioklubbnummer
      .map(nbr => nbr.bioklubbnummer)
      .map(nbr => parseInt(nbr === null ? 0 : nbr, 10))
      .reduce((acc, nbr) => acc + nbr, 0)}
      {usersWithoutBioklubbnummer !== showing.participants.length
      && <div>{usersWithoutBioklubbnummer.length} deltagare saknar bioklubbnummer: <ul>{usersWithoutBioklubbnummer}</ul></div>}
    </div>)
  };

  return (
    <Modal>
      <Padding>
        <Close onClick={closeModal}><i className="fa fa-times" aria-hidden="true"></i></Close>
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
              {renderBioklubbkortsnummer()}
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
