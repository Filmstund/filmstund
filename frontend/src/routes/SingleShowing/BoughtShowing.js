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
  isAdmin,
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

  return (
    <React.Fragment>
      {(isAdmin || showing.myTickets.length > 0) && (
        <MainButton onClick={onClickTickets}>Mina biljetter</MainButton>
      )}
      {!hasPaid && (
        <div>
          Betala <strong>{amountOwed / 100} kr</strong> till{" "}
          <PayToUser user={payTo} />
          <MainButton onClick={openSwishLink}>Öppna Swish</MainButton>
        </div>
      )}
    </React.Fragment>
  );
};

export default BoughtShowing;
