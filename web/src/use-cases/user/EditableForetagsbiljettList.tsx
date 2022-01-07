import styled from "@emotion/styled";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uniqueId } from "lodash";
import React, { ChangeEvent, useCallback, useState } from "react";
import {
  GiftCertificateInput,
  useAddGiftCertificatesMutation,
} from "../../__generated__/types";

import { margin } from "../../lib/style-vars";

import MainButton from "../common/ui/MainButton";
import { Foretagsbiljett } from "./Foretagsbiljett";
import { useToaster } from "../../common/toast/ToastContext";
import { Temporal } from "@js-temporal/polyfill";

const DEFAULT_DATE = Temporal.Now.plainDateISO().add({ years: 1 });

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
  expires,
}: ForetagsbiljettInputDraft): GiftCertificateInput => ({
  number,
  expireTime: expires,
});

export interface ForetagsbiljettInputDraft {
  id: string;
  number: string;
  expires: Temporal.PlainDate;
}

const EditableForetagsbiljettList: React.FC = () => {
  const [tickets, setTickets] = useState<ForetagsbiljettInputDraft[]>([]);
  const [, saveForetagsBiljetter] = useAddGiftCertificatesMutation();

  const toast = useToaster();

  const onClickSubmit = useCallback(() => {
    const ticketsToSubmit = tickets
      .filter(({ number }) => number && number.trim())
      .map(transformDraftToInput);

    return saveForetagsBiljetter({
      tickets: ticketsToSubmit,
    }).then(
      () => {
        setTickets([]);
        toast({ variant: "success", text: "Företagsbiljetter uppdaterades" });
      },
      (error: Error) => {
        toast({ variant: "danger", text: error.message });
      }
    );
  }, [saveForetagsBiljetter, tickets, toast]);

  const addForetagsbiljett = useCallback(() => {
    const foretagsbiljett: ForetagsbiljettInputDraft = {
      id: uniqueId("ftg-"),
      number: "",
      expires: DEFAULT_DATE,
    };
    setTickets((tickets) => [...tickets, foretagsbiljett]);
  }, []);

  const handleChange = useCallback(
    (id: string, event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setTickets((tickets) => {
        return tickets.map((t) => (t.id === id ? { ...t, number: value } : t));
      });
    },
    []
  );
  const handleSetExpires = useCallback((id: string, value: string) => {
    setTickets((tickets) => {
      return tickets.map((t) =>
        t.id === id ? { ...t, expires: Temporal.PlainDate.from(value) } : t
      );
    });
  }, []);
  const handlePressRemove = useCallback((id: string) => {
    setTickets((tickets) => {
      return tickets.filter((t) => t.id !== id);
    });
  }, []);

  return (
    <>
      <div>
        {tickets.map((biljett) => (
          <Foretagsbiljett
            key={biljett.id}
            biljett={biljett}
            editable={true}
            handleChangeForetagsbiljett={(v) => handleChange(biljett.id, v)}
            handleSetExpiresForetagsbiljett={(v) =>
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
    </>
  );
};

export default EditableForetagsbiljettList;
