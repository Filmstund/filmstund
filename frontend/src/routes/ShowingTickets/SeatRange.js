import React from "react";
import { formatSeatingRow } from "../../lib/summarizeSeatingRange";
import orderBy from "lodash-es/orderBy";

const SeatRange = ({ ticketRange }) => {
  if (!ticketRange) {
    return null;
  }

  const ticketRanges = orderBy(ticketRange.seatings, ["desc"], ["row"]);

  return ticketRanges.map(({ numbers, row }) => (
    <div key={row}>
      Rad {row}: {formatSeatingRow(numbers)}
    </div>
  ));
};

export default SeatRange;
