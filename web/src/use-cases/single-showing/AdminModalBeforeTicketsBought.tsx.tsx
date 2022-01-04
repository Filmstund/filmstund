import styled from "@emotion/styled";
import { ApolloError } from "@apollo/client";
import * as React from "react";
import { FormEventHandler, useState } from "react";
import { useMarkAsBought } from "../../apollo/mutations/showings/useMarkAsBought";
import { useAddTickets } from "../../apollo/mutations/useAddTickets";
import Field from "../common/ui/Field";
import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../../use-cases/common/ui/Input";

import MainButton from "../common/ui/MainButton";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import CopyValue from "../common/utils/CopyValue";
import { useStateWithHandleChange } from "../common/utils/useStateWithHandleChange";
import ParticipantsList from "./components/ParticipantsList";
import {
  ShowingAdminFragment,
  SingleShowingQuery,
} from "../../__generated__/types";
import { InputSpinner } from "./InputSpinner";

interface TicketListProps {
  tickets: NonNullable<
    ShowingAdminFragment["adminPaymentDetails"]
  >["attendees"];
}

const TicketListRow = styled.div`
  display: flex;
  padding: 10px;
  font-size: 13px;
  width: 100%;
  transition: background-color 0.1s ease;
  background: var(--main-bg);

  @media (min-width: 500px) {
    max-width: 100%;
  }
  @media (min-width: 700px) {
    max-width: 48%;
  }

  &:nth-of-type(even) {
    background: var(--footer-bg);
  }

  &:hover {
    background: #fdd835;
  }
`;

const TicketList: React.FC<TicketListProps> = ({ tickets }) => (
  <div>
    <SmallHeader>Deltagare</SmallHeader>
    {tickets.map((ticket) => (
      <TicketListRow key={ticket.user.id}>
        <div style={{ flex: 1 }}>
          <UserFullName user={ticket.user} />
        </div>
        {ticket.giftCertificateUsed && (
          <div style={{ width: 100, textAlign: "right" }}>
            <CopyValue useStricken text={ticket.giftCertificateUsed.number} />
          </div>
        )}
        <div style={{ width: 100, textAlign: "right" }}>
          <CopyValue useStricken text={ticket.filmstadenMembershipID || ""} />
        </div>
      </TicketListRow>
    ))}
  </div>
);

interface UserFullNameProps {
  user: NonNullable<
    ShowingAdminFragment["adminPaymentDetails"]
  >["attendees"][0]["user"];
}

const UserFullName: React.FC<UserFullNameProps> = ({ user }) => (
  <span>
    {user.firstName} '{user.nick}' {user.lastName}
  </span>
);

interface AdminModalBeforeTicketsBoughtProps {
  closeModal: () => void;
  showing: NonNullable<SingleShowingQuery["showing"]>;
  adminPaymentDetails: NonNullable<ShowingAdminFragment["adminPaymentDetails"]>;
}

const priceTransformer = (str: string) => parseInt(str, 10);

export const AdminModalBeforeTicketsBought: React.FC<
  AdminModalBeforeTicketsBoughtProps
> = ({ closeModal, showing, adminPaymentDetails }) => {
  const [cinemaTicketUrls, setCinemaTicketUrls] = useState<string[]>([]);
  const [ticketPrice, handlePriceChange] = useStateWithHandleChange(
    (showing.price || 0) / 100,
    priceTransformer
  );

  const [addTickets, { loading: addTicketsLoading, error: addTicketsError }] =
    useAddTickets();
  const [markAsBought, { loading: markBoughtLoading, error: markBoughtError }] =
    useMarkAsBought();

  const mutationInProgress = addTicketsLoading || markBoughtLoading;

  const mutationErrors = [addTicketsError, markBoughtError].filter(
    (f) => !!f
  ) as ApolloError[];

  const onFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const nonEmptyTicketUrls = cinemaTicketUrls.filter(
      (line) => line.trim().length !== 0
    );
    addTickets({
      variables: { showingId: showing.id, tickets: nonEmptyTicketUrls },
    })
      .then(() =>
        markAsBought({
          variables: { showingId: showing.id, price: ticketPrice * 100 },
        })
      )
      .then(() => {
        closeModal();
      });
  };

  const { filmstadenBuyLink, attendees } = adminPaymentDetails;

  return (
    <form onSubmit={onFormSubmit}>
      <Header>Boka</Header>
      {!filmstadenBuyLink &&
        "Ingen köplänk genererad ännu! Kom tillbaka senare!"}
      {filmstadenBuyLink && (
        <a href={filmstadenBuyLink} target="_blank" rel="noopener noreferrer">
          Öppna Filmstaden-länk i nytt fönster
        </a>
      )}
      <ParticipantsList participants={showing.attendees} showPhone={true} />
      <TicketList tickets={attendees} />
      <StatusMessageBox
        errors={mutationErrors.length > 0 ? mutationErrors : null}
      />
      <Field text="Biljettpris:">
        <Input
          type="number"
          value={ticketPrice}
          min={0}
          onChange={handlePriceChange}
        />
      </Field>
      <Field text="SF-biljettlänkar: (en per rad)">
        <TicketURLInput
          cinemaTicketUrls={cinemaTicketUrls}
          onChange={setCinemaTicketUrls}
        />
      </Field>
      {mutationInProgress && <InputSpinner />}
      <MainButton>Markera som bokad</MainButton>
    </form>
  );
};
