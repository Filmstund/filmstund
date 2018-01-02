import React from "react";
import { formatSeatingRow } from "../../lib/summarizeSeatingRange";
import { SmallHeader } from "../../Header";

const SeatRange = ({ range }) => (
  <div>
    <SmallHeader>Våra platser:</SmallHeader>
    {range.rows.map(row => (
      <div key={row}>
        Rad {row}: {formatSeatingRow(range.seatings[row])}
      </div>
    ))}
  </div>
);

export default SeatRange;
