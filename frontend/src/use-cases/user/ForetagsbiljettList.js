import React, { useCallback } from "react";

import { SmallHeader } from "../../use-cases/common/ui/Header";

import Foretagsbiljett from "./Foretagsbiljett";
import EditableForetagsbiljettList from "./EditableForetagsbiljettList";

const ForetagsbiljettList = ({
  addForetagsbiljett,
  deleteForetagsbiljett,
  foretagsbiljetter = []
}) => {
  const handleDeleteForetagsBiljett = useCallback(
    ({ status, number, expires }) => {
      switch (status) {
        case "Available":
          if (window.confirm("Är du säker på att du vill ta bort biljetten?")) {
            deleteForetagsbiljett({ number, expires });
          }
          break;
        case "Pending":
          window.alert(
            "Biljetten används på en visning som ej har bokats ännu"
          );
          break;
        case "Used":
        case "Expired":
          deleteForetagsbiljett({ number, expires });
          break;
        default:
          throw new Error(`Invalid status ${status}`);
      }
    }
  );

  return (
    <div>
      <SmallHeader>Företagsbiljetter</SmallHeader>
      {foretagsbiljetter.map((biljett, index) => (
        <Foretagsbiljett
          key={index}
          biljett={biljett}
          editable={false}
          handleRemoveForetagsbiljett={() =>
            handleDeleteForetagsBiljett(biljett)
          }
        />
      ))}
      <EditableForetagsbiljettList addForetagsbiljett={addForetagsbiljett} />
    </div>
  );
};

export default ForetagsbiljettList;
