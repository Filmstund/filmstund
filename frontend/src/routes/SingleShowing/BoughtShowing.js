import React from "react";
import Loader from "../../ProjectorLoader";
import withUserLoader from "../../loaders/UserLoader";
import MainButton from "../../MainButton";

const PayToUser = withUserLoader(({ user }) =>
  <span>
    <strong>{user.phone}</strong> ({user.firstName} '{user.nick}'{" "}
    {user.lastName})
  </span>
);

const BoughtShowing = ({ payData, showing, onClickTickets, openSwish }) => {
  if (!payData) {
    return <Loader />;
  }

  const { amountOwed, swishLink, hasPaid, payTo } = payData;

  const openSwishLink = () => openSwish(swishLink);

  if (hasPaid) {
    if (showing) {
      return <MainButton onClick={onClickTickets}>Mina biljetter</MainButton>
    }
  } else {
    return <div>
      Betala <strong>{amountOwed / 100} kr</strong> till{" "}
      <PayToUser userId={payTo} />
      <MainButton onClick={openSwishLink}>Öppna Swish</MainButton>
    </div>
  }
};

export default BoughtShowing;
