import React from "react";
import styled from "@emotion/styled";

const Textarea = styled.textarea`
  width: 100%;
  max-width: 600px;
`;

interface Props {
  cinemaTicketUrls: string[];
  onChange: (s: string[]) => void;
}

const TicketURLInput: React.FC<Props> = ({ cinemaTicketUrls, onChange }) => (
  <Textarea
    rows={5}
    value={cinemaTicketUrls.join("\n")}
    onChange={(event) => onChange(event.target.value.split("\n"))}
  />
);

export default TicketURLInput;
