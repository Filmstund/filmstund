import React from "react";
import PropTypes from "prop-types";

import { SmallHeader } from "../../Header";

import buildUserComponent from "./UserComponentBuilder";

const UserItem = buildUserComponent(({ user }) =>
  <div>
    {user.nick || user.name}
  </div>
);

const ParticipantsList = ({ participants }) => {

  return (<div>
    <SmallHeader>Deltagare</SmallHeader>
    {participants.map(userId =>
      <UserItem key={userId} userId={userId} />
    )}
    <div>
      {participants.length} deltagare
    </div>
  </div>)
}


ParticipantsList.propTypes = {
  participants: PropTypes.array.isRequired
};

export default ParticipantsList