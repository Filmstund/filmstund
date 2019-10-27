import React from "react";
import copy from "../../lib/copy";
import { useFadeState } from "../common/hooks/useFadeState";
import { GrayButton } from "../common/ui/MainButton";
import {
  SingleShowing_showing_participants,
  SingleShowing_showing_participants_user
} from "./containers/__generated__/SingleShowing";

const mapToUserAndFilterMe = (
  participants: SingleShowing_showing_participants[],
  meId: SeFilmUserID
): SingleShowing_showing_participants_user[] =>
  participants
    .map(p => p.user)
    .filter(
      f => !!f && f.id !== meId
    ) as SingleShowing_showing_participants_user[];

const formatParticipants = (
  users: SingleShowing_showing_participants_user[]
): string => {
  const nicks = users.map(
    user => user.nick || `${user.firstName} ${user.lastName}`
  );

  const nicksWithAt = nicks.map(nick => `@${nick}`);

  return nicksWithAt.join(" ");
};

export const CopyHighlightStringButton: React.FC<{
  meId: SeFilmUserID;
  participants: SingleShowing_showing_participants[];
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
