import React from "react";
import { formatRow } from "../../lib/summarizeRange";
import { SmallHeader } from "../../Header";

const RangeDisplay = ({ range }) => (
  <div>
    <SmallHeader>Våra platser:</SmallHeader>
    {range.rows.map(row => (
      <div key={row}>
        Rad {row}: {formatRow(range.seatings[row])}
      </div>
    ))}
  </div>
);

export default RangeDisplay;
