import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import UserItem from "./UserItem";
import { SmallHeader } from "../../use-cases/common/ui/Header";

const ParticipantContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const ParticipantsList = ({ participants, showPhone }) => {
  return (
    <div>
      <SmallHeader>{participants.length} Deltagare</SmallHeader>
      <ParticipantContainer>
        {participants.map(({ user }) => (
          <UserItem key={user.id} showPhone={showPhone} user={user} />
        ))}
      </ParticipantContainer>
    </div>
  );
};

ParticipantsList.propTypes = {
  participants: PropTypes.array.isRequired
};

export default ParticipantsList;
