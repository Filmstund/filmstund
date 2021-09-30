import React, { useCallback } from "react";

import { SmallHeader } from "../common/ui/Header";
import { UserProfile_me_foretagsbiljetter } from "./__generated__/UserProfile";
import EditableForetagsbiljettList from "./EditableForetagsbiljettList";

import Foretagsbiljett from "./Foretagsbiljett";
import { useDeleteForetagsbiljett } from "./useDeleteForetagsbiljett";

interface Props {
  foretagsbiljetter: UserProfile_me_foretagsbiljetter[];
}

export const ForetagsbiljettList: React.FC<Props> = ({ foretagsbiljetter }) => {
  const [deleteForetagsbiljett] = useDeleteForetagsbiljett();

  const handleDeleteForetagsBiljett = useCallback(
    ({ status, number, expires }: UserProfile_me_foretagsbiljetter) => {
      switch (status) {
        case "Available":
          if (window.confirm("Är du säker på att du vill ta bort biljetten?")) {
            deleteForetagsbiljett({
              variables: { ticket: { number, expires } },
            });
          }
          break;
        case "Pending":
          window.alert(
            "Biljetten används på en visning som ej har bokats ännu"
          );
          break;
        case "Used":
        case "Expired":
          deleteForetagsbiljett({ variables: { ticket: { number, expires } } });
          break;
        default:
          throw new Error(`Invalid status ${status}`);
      }
    },
    [deleteForetagsbiljett]
  );

  return (
    <div>
      <SmallHeader>Företagsbiljetter</SmallHeader>
      {foretagsbiljetter.map((biljett) => (
        <Foretagsbiljett
          key={biljett.number}
          biljett={biljett}
          editable={false}
          handleRemoveForetagsbiljett={() =>
            handleDeleteForetagsBiljett(biljett)
          }
        />
      ))}
      <EditableForetagsbiljettList />
    </div>
  );
};
