/** @jsx jsx */
import { jsx } from "@emotion/core";
import styled from "@emotion/styled";
import { faUserTie } from "@fortawesome/free-solid-svg-icons/faUserTie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import gql from "graphql-tag";
import * as React from "react";
import { SmallHeader } from "../../common/ui/Header";
import { SingleShowing_showing_participants } from "../containers/__generated__/SingleShowing";

import UserItem, { fragments as userItemFragments } from "./UserItem";

const ParticipantContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

interface Props {
  meId?: string;
  isAdmin?: boolean;
  participants: SingleShowing_showing_participants[];
  showPhone?: boolean;
  onClickItem?: (userId: string) => void;
}

const ParticipantsList: React.FC<Props> = ({
  meId,
  isAdmin = false,
  participants,
  showPhone = false,
  onClickItem
}) => {
  return (
    <div>
      <SmallHeader>{participants.length} Deltagare</SmallHeader>
      <ParticipantContainer>
        {participants.map(participant => {
          const user = participant.user!;

          return (
            <UserItem key={user.id} showPhone={showPhone} user={user}>
              {isAdmin &&
                user.id !== meId && (
                  <div
                    css={{
                      display: "inline-block",
                      cursor: "pointer",
                      marginTop: 10,
                      padding: 5
                    }}
                    onClick={() =>
                      window.confirm(
                        `Vill du ge admin till ${user.nick ||
                          user.firstName}? (Detta går ej att ångra!)`
                      ) &&
                      onClickItem &&
                      onClickItem(user.id)
                    }
                  >
                    <FontAwesomeIcon icon={faUserTie} /> Ge admin
                  </div>
                )}
            </UserItem>
          );
        })}
      </ParticipantContainer>
    </div>
  );
};

export const participantsListFragment = gql`
  fragment ParticipantsList on Participant {
    user {
      ...UserItem
      id
      nick
      firstName
    }
  }
  ${userItemFragments.user}
`;

export default ParticipantsList;
