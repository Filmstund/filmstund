import React, { lazy } from "react";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrash";

import Field from "../../use-cases/common/ui/Field";
import Input from "../../use-cases/common/ui/Input";
import { margin } from "../../lib/style-vars";
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

const Foretagsbiljett = ({
  biljett,
  index,
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
          onChange={v => handleChangeForetagsbiljett(index, v)}
        />
      ) : (
        <div>{biljett.number}</div>
      )}
    </BiljettField>
    <BiljettField text="Utgångsdatum">
      {editable ? (
        <DatePickerInput
          value={biljett.expires}
          onChange={v => handleSetExpiresForetagsbiljett(index, v)}
        />
      ) : (
        <div>{formatYMD(biljett.expires)}</div>
      )}
    </BiljettField>
    <BiljettField text="Status">
      {localizeTicketStatus(biljett.status)}
    </BiljettField>

    <IconButton
      size="2x"
      icon={faTrash}
      onClick={() => handleRemoveForetagsbiljett(biljett, index)}
    />
  </ForetagsbiljettWrapper>
);

export default Foretagsbiljett;
