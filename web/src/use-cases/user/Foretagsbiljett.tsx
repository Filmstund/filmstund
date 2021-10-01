import styled from "@emotion/styled";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, lazy } from "react";
import { ForetagsbiljettInput } from "../../__generated__/globalTypes";
import { formatYMD } from "../../lib/dateTools";
import { margin, SMALL_FONT_SIZE } from "../../lib/style-vars";

import Field from "../common/ui/Field";
import Input from "../../use-cases/common/ui/Input";
import { useHandleChangeEvent } from "../common/utils/useHandleChangeEvent";
import { UserProfile_me_foretagsbiljetter } from "./__generated__/UserProfile";

const DatePickerInput = lazy(
  () => import("../common/ui/date-picker/DatePickerInput")
);

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`;

const MaxWidthInput = styled(Input)`
  max-width: 13.6em;
  background: ${(props) =>
    props.disabled ? "rgba(0, 0, 0, 0.04)" : "inherit"};
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
  biljett: ForetagsbiljettInput;
  editable: true;
  handleChangeForetagsbiljett: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSetExpiresForetagsbiljett: (value: Date) => void;
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

const Foretagsbiljett: React.FC<Props> = (props) => (
  <ForetagsbiljettWrapper>
    <BiljettField text="Nummer">
      {props.editable ? (
        <MaxWidthInput
          type="text"
          value={props.biljett.number}
          maxLength={11}
          onChange={props.handleChangeForetagsbiljett}
        />
      ) : (
        <ValueField>{props.biljett.number}</ValueField>
      )}
    </BiljettField>
    <BiljettField text="Utgångsdatum">
      {props.editable ? (
        <DateInput
          value={props.biljett.expires}
          onChange={props.handleSetExpiresForetagsbiljett}
        />
      ) : (
        <ValueField>{formatYMD(props.biljett.expires)}</ValueField>
      )}
    </BiljettField>
    {"status" in props.biljett && props.biljett.status && (
      <BiljettField text="Status">
        <ValueField>{localizeTicketStatus(props.biljett.status)}</ValueField>
      </BiljettField>
    )}

    <div onClick={props.handleRemoveForetagsbiljett}>
      <IconButton size="2x" icon={faTrash} />
    </div>
  </ForetagsbiljettWrapper>
);

export default Foretagsbiljett;
