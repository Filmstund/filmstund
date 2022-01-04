import React from "react";
import copy from "../../lib/copy";
import { useFadeState } from "../common/hooks/useFadeState";
import { GrayButton } from "../common/ui/MainButton";
import { ParticipantsListFragment } from "../../__generated__/types";

const mapToUserAndFilterMe = (
  participants: ParticipantsListFragment[],
  meId: SeFilmUserID
): ParticipantsListFragment["userInfo"][] =>
  participants
    .map((p) => p.userInfo)
    .filter(
      (f) => !!f && f.id !== meId
    ) as ParticipantsListFragment["userInfo"][];

const formatParticipants = (
  users: ParticipantsListFragment["userInfo"][]
): string => {
  const nicks = users.map(
    (user) => user.nick || `${user.firstName} ${user.lastName}`
  );

  const nicksWithAt = nicks.map((nick) => `@${nick}`);

  return nicksWithAt.join(" ");
};

export const CopyHighlightStringButton: React.FC<{
  meId: SeFilmUserID;
  participants: ParticipantsListFragment[];
}> = ({ participants, meId }) => {
  const [active, bump] = useFadeState();

  const handleClick = () => {
    copy(formatParticipants(mapToUserAndFilterMe(participants, meId)) + " ");
    bump();
  };

  return (
    <GrayButton onClick={handleClick}>
      {active ? "Kopierat!" : "Kopiera highlightsträng"}
    </GrayButton>
  );
};
