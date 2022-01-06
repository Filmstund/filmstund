import React, { useState } from "react";
import MainButton from "../common/ui/MainButton";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import { navigateToShowing } from "../common/navigators";

import { FieldWithoutMaxWidth } from "../common/ui/Field";
import { SmallHeader } from "../common/ui/Header";
import { ScreenSeats } from "../ticket/ScreenSeats";
import {
  useAddTicketsMutation,
  useTicketQuery,
} from "../../__generated__/types";
import { SeatRange } from "./SeatRange";
import { Ticket } from "./Ticket";
import { useNavigate } from "react-router-dom";
import { useToaster } from "../../common/toast/ToastContext";

interface Props {
  webID: string;
}

export const TicketContainer: React.FC<Props> = ({ webID }) => {
  const [{ data }] = useTicketQuery({ variables: { webID } });
  const { me, showing } = data!;

  if (!showing) {
    throw new Error("Showing is missing");
  }

  const navigate = useNavigate();

  const [cinemaTicketUrls, setCinemaTicketUrls] = useState<string[]>([]);
  const [, addTickets] = useAddTicketsMutation();
  const toast = useToaster();

  const handleGoBackToShowing = () => {
    navigateToShowing(navigate, showing);
  };

  const handleSubmitCinemaTicketUrls = () => {
    const nonEmptyUrls = cinemaTicketUrls.filter(
      (line) => line.trim().length !== 0
    );

    addTickets({ showingId: showing.id, tickets: nonEmptyUrls }).then(
      ({ data, error }) => {
        setCinemaTicketUrls([]);
        if (data) {
          toast({ text: "Uppdaterades!", variant: "success" });
        } else if (error) {
          toast({ text: error.message, variant: "danger" });
        }
      }
    );
  };

  const { myTickets, ticketRange, filmstadenSeatMap } = showing;

  const tickets = myTickets || [];

  return (
    <>
      <MainButton onClick={handleGoBackToShowing}>
        Tillbaka till visning
      </MainButton>
      <SmallHeader>Våra platser:</SmallHeader>
      <SeatRange ticketRange={ticketRange} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        {ticketRange && (
          <ScreenSeats ticketRange={ticketRange} seatMap={filmstadenSeatMap} />
        )}
      </div>
      {tickets.map((ticket) => (
        <Ticket key={ticket.id} ticket={ticket} />
      ))}
      {showing.admin.id === me.id && (
        <FieldWithoutMaxWidth text="Lägg till Filmstaden-bokningslänkar">
          <TicketURLInput
            cinemaTicketUrls={cinemaTicketUrls}
            onChange={setCinemaTicketUrls}
          />
          <MainButton onClick={handleSubmitCinemaTicketUrls}>Skicka</MainButton>
        </FieldWithoutMaxWidth>
      )}
    </>
  );
};
