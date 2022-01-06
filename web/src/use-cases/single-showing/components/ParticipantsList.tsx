import styled from "@emotion/styled";
import { faUserTie } from "@fortawesome/free-solid-svg-icons/faUserTie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { SmallHeader } from "../../common/ui/Header";
import { ParticipantsListFragment } from "../../../__generated__/types";

import UserItem from "./UserItem";

const ParticipantContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

interface Props {
  meId?: string;
  isAdmin?: boolean;
  participants: ParticipantsListFragment[];
  showPhone?: boolean;
  onClickItem?: (userId: string) => void;
}

const ParticipantsList: React.FC<Props> = ({
  meId,
  isAdmin = false,
  participants,
  showPhone = false,
  onClickItem,
}) => {
  return (
    <div>
      <SmallHeader>{participants.length} Deltagare</SmallHeader>
      <ParticipantContainer>
        {participants.map((participant) => {
          const user = participant.userInfo!;

          return (
            <UserItem key={user.id} showPhone={showPhone} user={user}>
              {isAdmin && user.id !== meId && (
                <div
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                    marginTop: 10,
                    padding: 5,
                  }}
                  onClick={() =>
                    window.confirm(
                      `Vill du ge admin till ${
                        user.nick || user.firstName
                      }? (Detta går ej att ångra!)`
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

export default ParticipantsList;
