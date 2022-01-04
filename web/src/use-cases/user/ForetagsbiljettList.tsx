import React, { useCallback } from "react";

import { SmallHeader } from "../common/ui/Header";
import {
  GiftCertificate_Status,
  UserProfileQuery,
} from "../../__generated__/types";
import EditableForetagsbiljettList from "./EditableForetagsbiljettList";

import Foretagsbiljett from "./Foretagsbiljett";
import { useDeleteForetagsbiljett } from "./useDeleteForetagsbiljett";

interface Props {
  foretagsbiljetter: UserProfileQuery["me"]["giftCertificates"];
}

export const ForetagsbiljettList: React.FC<Props> = ({ foretagsbiljetter }) => {
  const [deleteForetagsbiljett] = useDeleteForetagsbiljett();

  const handleDeleteForetagsBiljett = useCallback(
    ({
      status,
      number,
      expireTime,
    }: UserProfileQuery["me"]["giftCertificates"][0]) => {
      switch (status) {
        case GiftCertificate_Status.Available:
          if (window.confirm("Är du säker på att du vill ta bort biljetten?")) {
            deleteForetagsbiljett({
              variables: { ticket: { number, expireTime } },
            });
          }
          break;
        case GiftCertificate_Status.Pending:
          window.alert(
            "Biljetten används på en visning som ej har bokats ännu"
          );
          break;
        case GiftCertificate_Status.Used:
        case GiftCertificate_Status.Expired:
          deleteForetagsbiljett({
            variables: { ticket: { number, expireTime } },
          });
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
