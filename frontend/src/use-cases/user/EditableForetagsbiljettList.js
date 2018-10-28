import React, { useState, useCallback } from "react";

import styled from "styled-components";

import MainButton from "../../use-cases/common/ui/MainButton";
import { formatYMD } from "../../lib/dateTools";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import faPlusCircle from "@fortawesome/fontawesome-free-solid/faPlusCircle";
import { useApolloMutationResult } from "../common/utils/useApolloMutationResult";

import { margin } from "../../lib/style-vars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import addYears from "date-fns/add_years";
import Foretagsbiljett from "./Foretagsbiljett";

const DEFAULT_DATE = addYears(new Date(), 1);

const IconButton = styled(FontAwesomeIcon)`
  padding-left: ${margin};
  cursor: pointer;
`;

const AddForetagsbiljettContainer = styled.div`
  max-width: 15em;
  display: flex;
  padding-bottom: 2em;
`;

const EditableForetagsbiljettList = props => {
  const [tickets, setTickets] = useState([]);

  const {
    errors,
    success,
    mutate: saveForetagsBiljetter
  } = useApolloMutationResult(props.addForetagsbiljett);

  const onClickSubmit = useCallback(
    () => {
      const ticketsToSubmit = tickets
        .filter(({ number }) => number && number.trim())
        .map(({ number, expires }) => ({
          number,
          expires: formatYMD(expires)
        }));

      return saveForetagsBiljetter(ticketsToSubmit).then(() => setTickets([]));
    },
    [tickets]
  );

  const addForetagsbiljett = useCallback(() => {
    const foretagsbiljett = { number: "", expires: DEFAULT_DATE };
    setTickets(tickets => [...tickets, foretagsbiljett]);
  });

  const handleChange = useCallback((index, value) => {
    setTickets(tickets => {
      tickets[index].number = value;
      return tickets;
    });
  });
  const handleSetExpires = useCallback((index, value) => {
    setTickets(tickets => {
      tickets[index].expires = value;
      return tickets;
    });
  });
  const handlePressRemove = useCallback(index => {
    setTickets(tickets => [
      ...tickets.slice(0, index),
      ...tickets.slice(index + 1)
    ]);
  });

  return (
    <>
      <StatusMessageBox
        errors={errors}
        success={success}
        successMessage="Företagsbiljetter uppdaterades!"
      />
      {tickets.map((biljett, index) => (
        <Foretagsbiljett
          key={index}
          biljett={biljett}
          editable={true}
          handleChangeForetagsbiljett={v => handleChange(index, v)}
          handleSetExpiresForetagsbiljett={v => handleSetExpires(index, v)}
          handleRemoveForetagsbiljett={() => handlePressRemove(index)}
        />
      ))}
      <AddForetagsbiljettContainer onClick={addForetagsbiljett}>
        <IconButton size="2x" icon={faPlusCircle} />
      </AddForetagsbiljettContainer>
      <MainButton onClick={onClickSubmit}>Spara företagsbiljetter</MainButton>
    </>
  );
};

export default EditableForetagsbiljettList;
