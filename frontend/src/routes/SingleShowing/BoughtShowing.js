import React from "react";
import Loader from "../../ProjectorLoader";
import MainButton from "../../MainButton";

const PayToUser = ({ user }) => (
  <span>
    <strong>{user.phone}</strong> ({user.firstName} '{user.nick}'{" "}
    {user.lastName})
  </span>
);

const BoughtShowing = ({
  attendeePaymentDetails,
  showing,
  onClickTickets,
  openSwish
}) => {
  if (!attendeePaymentDetails) {
    return <Loader />;
  }

  const { amountOwed, swishLink, hasPaid, payTo } = attendeePaymentDetails;

  const openSwishLink = () => openSwish(swishLink);

  if (hasPaid) {
    if (showing.myTickets.length > 0) {
      return <MainButton onClick={onClickTickets}>Mina biljetter</MainButton>;
    } else {
      return null;
    }
  } else {
    return (
      <div>
        Betala <strong>{amountOwed / 100} kr</strong> till{" "}
        <PayToUser user={payTo} />
        <MainButton onClick={openSwishLink}>Öppna Swish</MainButton>
      </div>
    );
  }
};

export default BoughtShowing;
