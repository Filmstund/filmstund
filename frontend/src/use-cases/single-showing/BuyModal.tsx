/** @jsx jsx */
import { jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { FormEventHandler } from "react";
import Center from "../../use-cases/common/ui/Center";
import Field from "../../use-cases/common/ui/Field";
import Header, { SmallHeader } from "../../use-cases/common/ui/Header";
import Input from "../../use-cases/common/ui/Input";

import MainButton from "../../use-cases/common/ui/MainButton";

import Modal from "../../use-cases/common/ui/Modal";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import CopyValue from "../../use-cases/common/utils/CopyValue";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import ParticipantsList from "./components/ParticipantsList";
import PaymentParticipantsList from "./components/PaymentParticipantsList";
import {
  SingleShowing_showing,
  SingleShowing_showing_adminPaymentDetails_filmstadenData,
  SingleShowing_showing_adminPaymentDetails_filmstadenData_user,
  SingleShowing_showing_adminPaymentDetails_participantPaymentInfos
} from "./containers/__generated__/SingleShowing";

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

interface TicketListProps {
  tickets: SingleShowing_showing_adminPaymentDetails_filmstadenData[];
}

const TicketListRow = styled.div`
  display: flex;
  padding: 10px;
  font-size: 13px;
  width: 100%;
  transition: background-color 0.1s ease;
  background: #f8f8f8;

  @media (min-width: 500px) {
    max-width: 100%;
  }
  @media (min-width: 700px) {
    max-width: 48%;
  }

  &:nth-of-type(even) {
    background: #e3e3e3;
  }

  &:hover {
    background: #fdd835;
  }
`;

const TicketList: React.FC<TicketListProps> = ({ tickets }) => (
  <div>
    <SmallHeader>Deltagare</SmallHeader>
    {tickets.map(ticket => (
      <TicketListRow key={ticket.user.id}>
        <div css={{ flex: 1 }}>
          <UserFullName user={ticket.user} />
        </div>
        {ticket.foretagsbiljett && (
          <div css={{ width: 100, textAlign: "right" }}>
            <CopyValue useStricken text={ticket.foretagsbiljett} />
          </div>
        )}
        <div css={{ width: 100, textAlign: "right" }}>
          <CopyValue useStricken text={ticket.filmstadenMembershipId || ""} />
        </div>
      </TicketListRow>
    ))}
  </div>
);

interface UserFullNameProps {
  user: SingleShowing_showing_adminPaymentDetails_filmstadenData_user;
}

const UserFullName: React.FC<UserFullNameProps> = ({ user }) => (
  <span>
    {user.firstName} '{user.nick}' {user.lastName}
  </span>
);

interface BuyModalProps {
  loading: boolean;
  errors: Error[] | null;
  ticketPrice: number;
  cinemaTicketUrls: string[];
  setPrice: (s: string) => void;
  setCinemaTicketUrls: (strs: string[]) => void;
  handleMarkBought: () => void;
  handlePaidChange: (
    info: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos
  ) => void;
  closeModal: () => void;
  showing: SingleShowing_showing;
}

const BuyModal: React.FC<BuyModalProps> = ({
  loading,
  errors,
  ticketPrice,
  cinemaTicketUrls,
  setPrice,
  setCinemaTicketUrls,
  handleMarkBought,
  handlePaidChange,
  closeModal,
  showing
}) => {
  if (loading || !showing.adminPaymentDetails) {
    return (
      <Modal>
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  const onFormSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    handleMarkBought();
  };

  const {
    ticketsBought,
    adminPaymentDetails: {
      filmstadenBuyLink,
      filmstadenData,
      participantPaymentInfos
    }
  } = showing;

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
            <form onSubmit={onFormSubmit}>
              <Header>Boka</Header>
              {!filmstadenBuyLink &&
                "Ingen köplänk genererad ännu! Kom tillbaka senare!"}
              {filmstadenBuyLink && (
                <a
                  href={filmstadenBuyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Öppna Filmstaden-länk i nytt fönster
                </a>
              )}
              <ParticipantsList
                participants={showing.participants}
                showPhone={true}
              />
              <TicketList tickets={filmstadenData} />
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

export default BuyModal;
