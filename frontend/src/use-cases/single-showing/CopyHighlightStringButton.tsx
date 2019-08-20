import React from "react";
import copy from "../../lib/copy";
import { useFadeState } from "../common/hooks/useFadeState";
import { GrayButton } from "../common/ui/MainButton";
import {
  SingleShowing_showing_participants,
  SingleShowing_showing_participants_user
} from "./containers/__generated__/SingleShowing";

const formatParticipants = (
  participants: SingleShowing_showing_participants[]
): string => {
  const users = participants
    .map(p => p.user)
    .filter(f => !!f) as SingleShowing_showing_participants_user[];

  const nicks = users.map(
    user => user.nick || `${user.firstName} ${user.lastName}`
  );

  const nicksWithAt = nicks.map(nick => `@${nick}`);

  return nicksWithAt.join(" ");
};

export const CopyHighlightStringButton: React.FC<{
  participants: SingleShowing_showing_participants[];
}> = ({ participants }) => {
  const [active, bump] = useFadeState();

  const handleClick = () => {
    copy(formatParticipants(participants) + " ");
    bump();
  };

  return (
    <GrayButton onClick={handleClick}>
      {active ? "Koperiat!" : "Kopiera highlightsträng"}
    </GrayButton>
  );
};
