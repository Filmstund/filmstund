import React from "react";
import Loader from "../../ProjectorLoader";
import buildUserComponent from "./UserComponentBuilder";
import MainButton from "../../MainButton";
import ParticipantList from "./ParticipantsList";

const UserItem = buildUserComponent(({ user }) =>
  <span>
    <b>{user.phone}</b> ({user.firstName} '{user.nick}' {user.lastName})
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
      {hasPaid && "Du har betalat!"}
      {!hasPaid &&
        <div>
          Betala <b>{amountOwed / 100} kr</b> till <UserItem userId={payTo} />
          <MainButton onClick={openSwishLink}>Öppna Swish</MainButton>
        </div>}
      <ParticipantList participants={showing.participants} />
    </div>
  );
};

export default BoughtShowing;
