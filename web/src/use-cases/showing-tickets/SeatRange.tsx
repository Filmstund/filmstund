import { orderBy } from "lodash";
import React from "react";
import { TicketFragment } from "../../__generated__/types";
import { formatSeatingRow } from "../../lib/summarizeSeatingRange";

interface Props {
  ticketRange: TicketFragment["ticketRange"];
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
