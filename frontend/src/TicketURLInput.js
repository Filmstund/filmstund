import React from "react";

const TicketURLInput = ({ cinemaTicketUrls, onChange }) => (
  <textarea
    cols={90}
    rows={5}
    value={cinemaTicketUrls.join("\n")}
    onChange={event => onChange(event.target.value.split("\n"))}
  />
);

export default TicketURLInput;
