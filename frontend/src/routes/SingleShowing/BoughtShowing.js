import React from "react";
import Loader from "../../ProjectorLoader";
import buildUserComponent from "./UserComponentBuilder";
import MainButton from "../../MainButton";

const UserItem = buildUserComponent(({ user }) =>
  <div>
    {user.nick || user.name} ({user.phone})
  </div>
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
          Betala {amountOwed / 100} till <UserItem userId={payTo} />
          <MainButton onClick={openSwishLink}>Betala</MainButton>
        </div>}
    </div>
  );
};

export default BoughtShowing;
