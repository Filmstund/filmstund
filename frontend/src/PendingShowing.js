import React from "react";

import { GreenButton, RedButton } from "./MainButton";
import buildUserComponent from "./UserComponentBuilder";

const UserItem = buildUserComponent(({ user }) =>
  <div>
    {user.nick || user.name} ({user.phone})
  </div>
);

const PendingShowing = ({
  showing,
  isParticipating,
  handleAttend,
  handleUnattend
}) =>
  <div>
    {!isParticipating &&
      <GreenButton onClick={handleAttend}>Jag hänger på!</GreenButton>}
    {isParticipating && <RedButton onClick={handleUnattend}>Avanmäl</RedButton>}
    <div>
      {showing.participants.map(userId =>
        <UserItem key={userId} userId={userId} />
      )}
    </div>
  </div>;

export default PendingShowing;
