import React, { useState } from "react";
import { useAddTickets } from "../../apollo/mutations/useAddTickets";
import { useHistory } from "react-router-dom";
import MainButton from "../../use-cases/common/ui/MainButton";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { navigateToShowing } from "../common/navigators";

import { FieldWithoutMaxWidth } from "../common/ui/Field";
import { SmallHeader } from "../common/ui/Header";
import { ScreenSeats } from "../ticket/ScreenSeats";
import {
  TicketQuery_me,
  TicketQuery_showing,
} from "./__generated__/TicketQuery";
import { SeatRange } from "./SeatRange";
import { Ticket } from "./Ticket";

interface Props {
  showing: TicketQuery_showing;
  me: TicketQuery_me;
}

export const TicketContainer: React.FC<Props> = ({ me, showing }) => {
  const history = useHistory();

  const [cinemaTicketUrls, setCinemaTicketUrls] = useState<string[]>([]);
  const [addTickets, { error, called, loading }] = useAddTickets();
  const success = called && !error && !loading;

  const handleGoBackToShowing = () => {
    navigateToShowing(history, showing);
  };

  const handleSubmitCinemaTicketUrls = () => {
    const nonEmptyUrls = cinemaTicketUrls.filter(
      (line) => line.trim().length !== 0
    );

    addTickets({
      variables: { showingId: showing.id, tickets: nonEmptyUrls },
    }).then(() => setCinemaTicketUrls([]));
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
      <StatusMessageBox
        success={success}
        errors={error ? [error] : null}
        successMessage="Uppdaterades!"
      />
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
