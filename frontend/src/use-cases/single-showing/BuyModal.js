/** @jsx jsx */
import { jsx } from "@emotion/core";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

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
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";

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

const TicketList = ({ tickets }) => (
  <div>
    <SmallHeader>Deltagare</SmallHeader>
    {tickets.map(ticket => (
      <div key={ticket.user.id} css={{ display: "flex" }}>
        <div>
          <UserFullName user={ticket.user} />
        </div>
        <div css={{ flex: 1, paddingLeft: "1rem" }}>
          <CopyValue useStricken text={ticket.foretagsbiljett} />
        </div>
        <div css={{ flex: 1, paddingLeft: "1rem" }}>
          <CopyValue useStricken text={ticket.sfMembershipId} />
        </div>
      </div>
    ))}
  </div>
);

const UserFullName = ({ user }) => (
  <span>
    {user.firstName} '{user.nick}' {user.lastName}
  </span>
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
              <TicketList tickets={sfData} />
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
