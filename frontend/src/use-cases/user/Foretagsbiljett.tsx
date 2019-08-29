import styled from "@emotion/styled";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { lazy } from "react";
import { formatYMD } from "../../lib/dateTools";
import { margin, SMALL_FONT_SIZE } from "../../lib/style-vars";

import Field from "../../use-cases/common/ui/Field";
import Input from "../../use-cases/common/ui/Input";
import { useHandleChangeEvent } from "../common/utils/useHandleChangeEvent";
import { UserProfile_me_foretagsbiljetter } from "./__generated__/UserProfile";

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

const localizeTicketStatus = (status: string) => {
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

const isIOS = /iPad|iPhone|iPod/.test(navigator.platform);

const DateInput = ({ onChange, ...props }: any) => {
  const handleChange = useHandleChangeEvent(onChange);

  if (isIOS) {
    return <Input type="date" onChange={handleChange} {...props} />;
  } else {
    return <DatePickerInput onChange={onChange} {...props} />;
  }
};

interface EditableForetagsbiljettProps {
  biljett: UserProfile_me_foretagsbiljetter;
  editable: true;
  handleChangeForetagsbiljett: () => void;
  handleSetExpiresForetagsbiljett: () => void;
  handleRemoveForetagsbiljett: () => void;
}

interface ForetagsbiljettProps {
  biljett: UserProfile_me_foretagsbiljetter;
  editable: false;
  handleChangeForetagsbiljett?: undefined;
  handleSetExpiresForetagsbiljett?: undefined;
  handleRemoveForetagsbiljett: () => void;
}

type Props = EditableForetagsbiljettProps | ForetagsbiljettProps;

const Foretagsbiljett: React.FC<Props> = ({
  biljett,
  editable,
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
    {biljett.status && (
      <BiljettField text="Status">
        <ValueField>{localizeTicketStatus(biljett.status)}</ValueField>
      </BiljettField>
    )}

    <div onClick={handleRemoveForetagsbiljett}>
      <IconButton size="2x" icon={faTrash} />
    </div>
  </ForetagsbiljettWrapper>
);

export default Foretagsbiljett;
