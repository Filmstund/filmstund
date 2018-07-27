import React from "react";
import BoughtShowing from "../BoughtShowing";
import PendingShowing from "../PendingShowing";

const ShowingPaymentContainer = ({
  foretagsbiljetter,
  showing,
  isAdmin,
  onClickTickets,
  openSwish,
  isParticipating
}) => {
  if (showing.ticketsBought) {
    if (isParticipating) {
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

ShowingPaymentContainer.fragments = {
  showing: BoughtShowing.fragments.showing,
  currentUser: PendingShowing.fragments.currentUser
};

export default ShowingPaymentContainer;
