import styled from "@emotion/styled";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import addYears from "date-fns/addYears";
import { uniqueId } from "lodash-es";
import React, { ChangeEvent, useCallback, useState } from "react";
import { GiftCertificateDTOInput } from "../../__generated__/globalTypes";
import { formatYMD } from "../../lib/dateTools";

import { margin } from "../../lib/style-vars";

import MainButton from "../../use-cases/common/ui/MainButton";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import Foretagsbiljett from "./Foretagsbiljett";
import { useAddForetagsbiljett } from "./useAddForetagsbiljett";

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

const transformDraftToInput = ({
  number,
  expiresAt
}: ForetagsbiljettInputDraft): GiftCertificateDTOInput => ({
  number,
  expiresAt: formatYMD(expiresAt)
});

interface ForetagsbiljettInputDraft {
  id: string;
  number: string;
  expiresAt: Date;
}

const EditableForetagsbiljettList: React.FC = () => {
  const [tickets, setTickets] = useState<ForetagsbiljettInputDraft[]>([]);
  const [
    saveForetagsBiljetter,
    { called, loading, error }
  ] = useAddForetagsbiljett();
  const success = called && !error && !loading;

  const onClickSubmit = useCallback(
    () => {
      const ticketsToSubmit = tickets
        .filter(({ number }) => number && number.trim())
        .map(transformDraftToInput);

      return saveForetagsBiljetter({
        variables: { tickets: ticketsToSubmit }
      }).then(() => setTickets([]));
    },
    [saveForetagsBiljetter, tickets]
  );

  const addForetagsbiljett = useCallback(() => {
    const foretagsbiljett: ForetagsbiljettInputDraft = {
      id: uniqueId("ftg-"),
      number: "",
      expiresAt: DEFAULT_DATE
    };
    setTickets(tickets => [...tickets, foretagsbiljett]);
  }, []);

  const handleChange = useCallback(
    (id: string, event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setTickets(tickets => {
        return tickets.map(t => (t.id === id ? { ...t, number: value } : t));
      });
    },
    []
  );
  const handleSetExpires = useCallback((id: string, value: Date) => {
    setTickets(tickets => {
      return tickets.map(t => (t.id === id ? { ...t, expiresAt: value } : t));
    });
  }, []);
  const handlePressRemove = useCallback((id: string) => {
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
            biljett={transformDraftToInput(biljett)}
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
        errors={error ? error.graphQLErrors : null}
        success={success}
        successMessage="Företagsbiljetter uppdaterades!"
      />
    </>
  );
};

export default EditableForetagsbiljettList;
