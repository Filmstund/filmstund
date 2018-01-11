import React from "react";
import { formatSeatingRow } from "../../lib/summarizeSeatingRange";
import _ from "lodash";

const SeatRange = ({ ticketRange }) => {
  if (!ticketRange) {
    return null;
  }

  const ticketRanges = _.orderBy(ticketRange.seatings, ["desc"], ["row"]);

  return ticketRanges.map(({ numbers, row }) => (
    <div key={row}>
      Rad {row}: {formatSeatingRow(numbers)}
    </div>
  ));
};

export default SeatRange;
