import React, { useState, useCallback } from "react";

import styled from "@emotion/styled";
import { uniqueId } from "lodash-es";

import MainButton from "../../use-cases/common/ui/MainButton";
import { formatYMD } from "../../lib/dateTools";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import { useApolloMutationResult } from "../common/utils/useApolloMutationResult";

import { margin } from "../../lib/style-vars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import addYears from "date-fns/addYears";
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

  const onClickSubmit = useCallback(() => {
    const ticketsToSubmit = tickets
      .filter(({ number }) => number && number.trim())
      .map(({ number, expires }) => ({
        number,
        expires: formatYMD(expires)
      }));

    return saveForetagsBiljetter(ticketsToSubmit).then(() => setTickets([]));
  }, [saveForetagsBiljetter, tickets]);

  const addForetagsbiljett = useCallback(() => {
    const foretagsbiljett = {
      id: uniqueId("ftg-"),
      number: "",
      expires: DEFAULT_DATE
    };
    setTickets(tickets => [...tickets, foretagsbiljett]);
  }, []);

  const handleChange = useCallback((id, event) => {
    const { value } = event.target;
    setTickets(tickets => {
      return tickets.map(t => (t.id === id ? { ...t, number: value } : t));
    });
  }, []);
  const handleSetExpires = useCallback((id, value) => {
    setTickets(tickets => {
      return tickets.map(t => (t.id === id ? { ...t, expires: value } : t));
    });
  }, []);
  const handlePressRemove = useCallback(id => {
    setTickets(tickets => {
      return tickets.filter(t => t.id !== id);
    });
  }, []);

  return (
    <>
      <div>
        {tickets.map(biljett => (
          <Foretagsbiljett
            key={biljett.id}
            biljett={biljett}
            editable={true}
            handleChangeForetagsbiljett={v => handleChange(biljett.id, v)}
            handleSetExpiresForetagsbiljett={v =>
              handleSetExpires(biljett.id, v)
            }
            handleRemoveForetagsbiljett={() => handlePressRemove(biljett.id)}
          />
        ))}
      </div>
      <AddForetagsbiljettContainer onClick={addForetagsbiljett}>
        <IconButton size="2x" icon={faPlusCircle} />
      </AddForetagsbiljettContainer>
      <MainButton onClick={onClickSubmit}>Spara företagsbiljetter</MainButton>
      <StatusMessageBox
        errors={errors}
        success={success}
        successMessage="Företagsbiljetter uppdaterades!"
      />
    </>
  );
};

export default EditableForetagsbiljettList;
