import React from "react";
import Loader from "../../ProjectorLoader";
import withUserLoader from "../../loaders/UserLoader";
import MainButton from "../../MainButton";
import ParticipantList from "./ParticipantsList";
import Ticket from "./Ticket";

const PayToUser = withUserLoader(({ user }) =>
  <span>
    <strong>{user.phone}</strong> ({user.firstName} '{user.nick}'{" "}
    {user.lastName})
  </span>
);

const BoughtShowing = ({ payData, showing, openSwish }) => {
  if (!payData) {
    return <Loader />;
  }

  const { amountOwed, swishLink, hasPaid, payTo } = payData;

  const openSwishLink = () => openSwish(swishLink);

  return (
    <div>
      {hasPaid && showing && <Ticket showingId={showing.id} />}
      {!hasPaid &&
        <div>
          Betala <strong>{amountOwed / 100} kr</strong> till{" "}
          <PayToUser userId={payTo} />
          <MainButton onClick={openSwishLink}>Öppna Swish</MainButton>
        </div>}
      <ParticipantList participants={showing.participants} />
    </div>
  );
};

export default BoughtShowing;
