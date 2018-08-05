import React from "react";
import styled from "styled-components";

import UserItem from "./UserItem";
import { SmallHeader } from "../../common/ui/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faUserTie from "@fortawesome/fontawesome-free-solid/faUserTie";
import gql from "graphql-tag";

const ParticipantContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const ParticipantsList = ({
  meId,
  isAdmin,
  participants,
  showPhone,
  onClickItem
}) => {
  return (
    <div>
      <SmallHeader>{participants.length} Deltagare</SmallHeader>
      <ParticipantContainer>
        {participants.map(({ user }) => (
          <UserItem key={user.id} showPhone={showPhone} user={user}>
            {isAdmin &&
              user.id !== meId && (
                <div
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                    marginTop: 10,
                    padding: 5
                  }}
                  onClick={() =>
                    window.confirm(
                      `Vill du ge admin till ${user.nick ||
                        user.firstName}? (Detta går ej att ångra!)`
                    ) && onClickItem(user.id)
                  }
                >
                  <FontAwesomeIcon icon={faUserTie} /> Ge admin
                </div>
              )}
          </UserItem>
        ))}
      </ParticipantContainer>
    </div>
  );
};

ParticipantsList.fragments = {
  participant: gql`
    fragment ParticipantsList on Participant {
      user {
        ...UserItem
        id
        nick
        firstName
      }
    }
    ${UserItem.fragments.user}
  `
};

export default ParticipantsList;
