import React from "react";
import styled from "@emotion/styled";

const Textarea = styled.textarea`
  width: 100%;
  max-width: 600px;
`;

const TicketURLInput = ({ cinemaTicketUrls, onChange }) => (
  <Textarea
    rows={5}
    value={cinemaTicketUrls.join("\n")}
    onChange={event => onChange(event.target.value.split("\n"))}
  />
);

export default TicketURLInput;
