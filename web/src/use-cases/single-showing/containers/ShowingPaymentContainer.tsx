import React from "react";
import { BoughtShowing } from "../BoughtShowing";
import { PendingShowing } from "../PendingShowing";
import { GiftCertificateFragment } from "../../../__generated__/types";
import { SingleShowingScreenShowing } from "./types";

interface Props {
  isAdmin: boolean;
  isParticipating: boolean;
  showing: SingleShowingScreenShowing;
  foretagsbiljetter: GiftCertificateFragment[];
  onClickTickets: () => void;
  openSwish: (swishLink?: string) => void;
}

export const ShowingPaymentContainer: React.VFC<Props> = ({
  foretagsbiljetter,
  showing,
  isAdmin,
  onClickTickets,
  openSwish,
  isParticipating,
}) => {
  if (showing.ticketsBought) {
    if (isParticipating && showing.attendeePaymentDetails) {
      return (
        <BoughtShowing
          myTickets={showing.myTickets}
          isAdmin={isAdmin}
          onClickTickets={onClickTickets}
          openSwish={openSwish}
          attendeePaymentDetails={showing.attendeePaymentDetails}
        />
      );
    } else {
      return null;
    }
  } else {
    return (
      <PendingShowing
        showingId={showing.id}
        foretagsbiljetter={foretagsbiljetter}
        isParticipating={isParticipating}
      />
    );
  }
};
