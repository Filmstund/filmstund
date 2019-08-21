import { orderBy } from "lodash-es";
import React from "react";
import { Ticket_ticketRange } from "../../apollo/mutations/__generated__/Ticket";
import { formatSeatingRow } from "../../lib/summarizeSeatingRange";

interface Props {
  ticketRange: Ticket_ticketRange | null;
}

export const SeatRange: React.FC<Props> = ({ ticketRange }) => {
  if (!ticketRange) {
    return null;
  }

  const ticketRanges = orderBy(ticketRange.seatings || [], ["row"], ["asc"]);

  return (
    <>
      {ticketRanges.map(({ numbers, row }) => (
        <div key={row}>
          Rad {row}: {formatSeatingRow(numbers || [])}
        </div>
      ))}
    </>
  );
};
