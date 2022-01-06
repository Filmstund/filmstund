import React from "react";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import MainButton from "../common/ui/MainButton";
import {
  AdminAttendeePaymentDetails,
  AttendeePaymentDetails,
} from "./containers/types";

const PayToUser: React.VFC<{ user: AdminAttendeePaymentDetails["user"] }> = ({
  user,
}) => (
  <span>
    <strong>{user.phone}</strong> ({user.firstName} '{user.nick}'{" "}
    {user.lastName})
  </span>
);

interface BoughtShowingProps {
  isAdmin: boolean;
  attendeePaymentDetails: AttendeePaymentDetails;
  myTickets: object[];
  onClickTickets: () => void;
  openSwish: (swishLink?: string) => void;
}

export const BoughtShowing: React.VFC<BoughtShowingProps> = ({
  isAdmin,
  attendeePaymentDetails,
  myTickets,
  onClickTickets,
  openSwish,
}) => {
  if (!attendeePaymentDetails) {
    return <Loader />;
  }

  const { amountOwed, swishLink, hasPaid, payTo } = attendeePaymentDetails;

  return (
    <>
      {(isAdmin || myTickets.length > 0) && (
        <MainButton onClick={onClickTickets}>Mina biljetter</MainButton>
      )}
      {!hasPaid && (
        <div>
          Betala <strong>{amountOwed} kr</strong> till{" "}
          <PayToUser user={payTo} />
          {swishLink ? (
            <MainButton onClick={() => openSwish(swishLink)}>
              Öppna Swish
            </MainButton>
          ) : (
            "Ingen swishlänk"
          )}
        </div>
      )}
    </>
  );
};
