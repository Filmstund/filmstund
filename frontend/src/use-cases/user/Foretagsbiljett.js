import React, { lazy } from "react";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrash";

import Field from "../../use-cases/common/ui/Field";
import Input from "../../use-cases/common/ui/Input";
import { margin, SMALL_FONT_SIZE } from "../../lib/style-vars";
import { formatYMD } from "../../lib/dateTools";

const DatePickerInput = lazy(() =>
  import("../../use-cases/common/ui/date-picker/DatePickerInput")
);

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`;

const ForetagsbiljettInput = styled(Input)`
  max-width: 13.6em;
  background: ${props => (props.disabled ? "rgba(0, 0, 0, 0.04)" : "inherit")};
`;

const IconButton = styled(FontAwesomeIcon)`
  padding-left: ${margin};
  cursor: pointer;
`;

const BiljettField = styled(Field)`
  padding: 0 0.5em;
`;

const localizeTicketStatus = status => {
  switch (status) {
    case "Available":
      return "Tillgänglig";
    case "Pending":
      return "Upptagen";
    case "Used":
      return "Använd";
    case "Expired":
      return "Utgången";
    default:
      return status;
  }
};

const ValueField = styled.div`
  font-size: ${SMALL_FONT_SIZE};
`;
const Foretagsbiljett = ({
  biljett,
  editable = true,
  handleChangeForetagsbiljett,
  handleSetExpiresForetagsbiljett,
  handleRemoveForetagsbiljett
}) => (
  <ForetagsbiljettWrapper>
    <BiljettField text="Nummer">
      {editable ? (
        <ForetagsbiljettInput
          type="text"
          value={biljett.number}
          maxLength={11}
          onChange={handleChangeForetagsbiljett}
        />
      ) : (
        <ValueField>{biljett.number}</ValueField>
      )}
    </BiljettField>
    <BiljettField text="Utgångsdatum">
      {editable ? (
        <DateInput
          value={biljett.expires}
          onChange={handleSetExpiresForetagsbiljett}
        />
      ) : (
        <ValueField>{formatYMD(biljett.expires)}</ValueField>
      )}
    </BiljettField>
    <BiljettField text="Status">
      {localizeTicketStatus(biljett.status)}
    </BiljettField>

    <IconButton
      size="2x"
      icon={faTrash}
      onClick={handleRemoveForetagsbiljett}
    />
  </ForetagsbiljettWrapper>
);

export default Foretagsbiljett;
