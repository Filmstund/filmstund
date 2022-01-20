import React, { useCallback } from "react";

import { SmallHeader } from "../common/ui/Header";
import {
  GiftCertificate_Status,
  GiftCertificateFragment,
  useDeleteGiftCertificateMutation,
  UserProfileQuery,
} from "../../__generated__/types";
import { EditableForetagsbiljettList } from "./EditableForetagsbiljettList";

import { Foretagsbiljett } from "./Foretagsbiljett";

interface Props {
  foretagsbiljetter: UserProfileQuery["me"]["giftCertificates"];
}

export const ForetagsbiljettList: React.FC<Props> = ({ foretagsbiljetter }) => {
  const [, deleteGiftCertificate] = useDeleteGiftCertificateMutation();

  const handleDeleteForetagsBiljett = useCallback(
    ({ status, number, expireTime }: GiftCertificateFragment) => {
      switch (status) {
        case GiftCertificate_Status.Pending:
          window.alert(
            "Biljetten används på en visning som ej har bokats ännu"
          );
          break;
        case GiftCertificate_Status.Used:
        case GiftCertificate_Status.Expired:
          deleteGiftCertificate({
            ticket: { number, expireTime },
          });
          break;
        case GiftCertificate_Status.Available:
        default:
          if (window.confirm("Är du säker på att du vill ta bort biljetten?")) {
            deleteGiftCertificate({
              ticket: { number, expireTime },
            });
          }
      }
    },
    [deleteGiftCertificate]
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
