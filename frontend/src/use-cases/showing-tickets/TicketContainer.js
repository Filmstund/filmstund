import React, { useState, useCallback } from "react";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import MainButton from "../../use-cases/common/ui/MainButton";
import Ticket from "./Ticket";
import SeatRange from "./SeatRange";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../../use-cases/common/ui/PageWidthWrapper";
import { ScreenSeats } from "../../use-cases/ticket/ScreenSeats";
import { SmallHeader } from "../../use-cases/common/ui/Header";
import { navigateToShowing } from "../common/navigators/index";

import { FieldWithoutMaxWidth } from "../common/ui/Field";
import { useApolloMutationResult } from "../common/utils/useApolloMutationResult";

const TicketContainer = props => {
  const {
    data: { me, showing },
    history
  } = props;

  const [cinemaTicketUrls, setCinemaTicketUrls] = useState([]);
  const { errors, success, mutate: addTickets } = useApolloMutationResult(
    props.addTickets
  );

  const handleGoBackToShowing = useCallback(() => {
    navigateToShowing(history, showing);
  });

  const handleSubmitCinemaTicketUrls = useCallback(() => {
    const nonEmptyUrls = cinemaTicketUrls.filter(
      line => line.trim().length !== 0
    );

    addTickets(showing.id, nonEmptyUrls).then(() => setCinemaTicketUrls([]));
  });

  const { myTickets, ticketRange, sfSeatMap } = showing;
  return (
    <PageWidthWrapper>
      <MainButton onClick={handleGoBackToShowing}>
        Tillbaka till visning
      </MainButton>
      <SmallHeader>Våra platser:</SmallHeader>
      <SeatRange ticketRange={ticketRange} />
      <ScreenSeats ticketRange={ticketRange} seatMap={sfSeatMap} />
      {myTickets.map(ticket => (
        <Ticket key={ticket.id} {...ticket} />
      ))}
      <StatusMessageBox
        success={success}
        errors={errors}
        successMessage="Uppdaterades!"
      />
      {showing.admin.id === me.id && (
        <FieldWithoutMaxWidth text="Lägg till SF-bokningslänkar">
          <TicketURLInput
            cinemaTicketUrls={cinemaTicketUrls}
            onChange={setCinemaTicketUrls}
          />
          <MainButton onClick={handleSubmitCinemaTicketUrls}>Skicka</MainButton>
        </FieldWithoutMaxWidth>
      )}
    </PageWidthWrapper>
  );
};

export default TicketContainer;
