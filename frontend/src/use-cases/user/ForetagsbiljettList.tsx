import React, { useCallback } from "react";
import { GiftCertificateDTO_Status } from "../../__generated__/globalTypes";
import { exhaustSwitchCase } from "../../types";

import { SmallHeader } from "../common/ui/Header";
import { UserProfile_me_giftCertificates } from "./__generated__/UserProfile";
import EditableForetagsbiljettList from "./EditableForetagsbiljettList";

import Foretagsbiljett from "./Foretagsbiljett";
import { useDeleteForetagsbiljett } from "./useDeleteForetagsbiljett";

interface Props {
  foretagsbiljetter: UserProfile_me_giftCertificates[];
}

const ForetagsbiljettList: React.FC<Props> = ({ foretagsbiljetter }) => {
  const [deleteForetagsbiljett] = useDeleteForetagsbiljett();

  const handleDeleteForetagsBiljett = useCallback(
    ({ status, number, expiresAt }: UserProfile_me_giftCertificates) => {
      switch (status) {
        case GiftCertificateDTO_Status.AVAILABLE:
          if (window.confirm("Är du säker på att du vill ta bort biljetten?")) {
            deleteForetagsbiljett({
              variables: { ticket: { number, expiresAt } }
            });
          }
          break;
        case GiftCertificateDTO_Status.PENDING:
          window.alert(
            "Biljetten används på en visning som ej har bokats ännu"
          );
          break;
        case GiftCertificateDTO_Status.USED:
        case GiftCertificateDTO_Status.EXPIRED:
          deleteForetagsbiljett({
            variables: { ticket: { number, expiresAt } }
          });
          break;
        case GiftCertificateDTO_Status.UNKNOWN:
          throw new Error("Unknown GiftCertificate status");
        default:
          return exhaustSwitchCase(status);
      }
    },
    [deleteForetagsbiljett]
  );

  return (
    <div>
      <SmallHeader>Företagsbiljetter</SmallHeader>
      {foretagsbiljetter.map(biljett => (
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

export default ForetagsbiljettList;
