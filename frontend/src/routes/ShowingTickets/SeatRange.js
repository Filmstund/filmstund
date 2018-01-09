import React from "react";
import { formatSeatingRow } from "../../lib/summarizeSeatingRange";
import { SmallHeader } from "../../Header";
import _ from "lodash";

const SeatRange = ({ range }) => (
  <div>
    <SmallHeader>Våra platser:</SmallHeader>
    {_.keys(range).map(row => (
      <div key={row}>
        Rad {row}: {formatSeatingRow(range[row].map(r => r.number))}
      </div>
    ))}
  </div>
);

export default SeatRange;
