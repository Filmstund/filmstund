import styled from "@emotion/styled";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";
import { margin, SMALL_FONT_SIZE } from "../../lib/style-vars";

import Field from "../common/ui/Field";
import Input from "../../use-cases/common/ui/Input";
import { ForetagsbiljettInputDraft } from "./EditableForetagsbiljettList";
import {
  GiftCertificate_Status,
  GiftCertificateFragment,
} from "../../__generated__/types";
import { DateInput } from "./DateInput";

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

const localizeTicketStatus = (status: GiftCertificate_Status) => {
  switch (status) {
    case GiftCertificate_Status.Available:
      return "Tillgänglig";
    case GiftCertificate_Status.Expired:
      return "Utgången";
    case GiftCertificate_Status.Pending:
      return "Upptagen";
    case GiftCertificate_Status.Used:
      return "Använd";
    case GiftCertificate_Status.Unknown:
    default:
      return status;
  }
};

const ValueField = styled.div`
  font-size: ${SMALL_FONT_SIZE};
`;

interface EditableForetagsbiljettProps {
  biljett: ForetagsbiljettInputDraft;
  editable: true;
  handleChangeForetagsbiljett: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSetExpiresForetagsbiljett: (value: string) => void;
  handleRemoveForetagsbiljett: () => void;
}

interface ForetagsbiljettProps {
  biljett: GiftCertificateFragment;
  editable: false;
  handleChangeForetagsbiljett?: undefined;
  handleSetExpiresForetagsbiljett?: undefined;
  handleRemoveForetagsbiljett: () => void;
}

type Props = EditableForetagsbiljettProps | ForetagsbiljettProps;

export const Foretagsbiljett: React.FC<Props> = (props) => (
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
          value={props.biljett.expires.toString()}
          onChange={props.handleSetExpiresForetagsbiljett}
        />
      ) : (
        <ValueField>{props.biljett.expireTime.toString()}</ValueField>
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
