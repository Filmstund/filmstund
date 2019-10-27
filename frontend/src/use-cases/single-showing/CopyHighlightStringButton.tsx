import React from "react";
import copy from "../../lib/copy";
import { useFadeState } from "../common/hooks/useFadeState";
import { GrayButton } from "../common/ui/MainButton";
import {
  SingleShowing_showing_adminPaymentDetails_attendees,
  SingleShowing_showing_adminPaymentDetails_attendees_user,
} from "./containers/__generated__/SingleShowing";

const mapToUserAndFilterMe = (
  participants: SingleShowing_showing_adminPaymentDetails_attendees[],
  meId: FilmstundUserID
): SingleShowing_showing_adminPaymentDetails_attendees_user[] =>
  participants.map(p => p.user).filter(f => f.id !== meId);

const formatParticipants = (
  users: SingleShowing_showing_adminPaymentDetails_attendees_user[]
): string => {
  const nicks = users.map(
    user => user.nick || `${user.firstName} ${user.lastName}`
  );

  const nicksWithAt = nicks.map(nick => `@${nick}`);

  return nicksWithAt.join(" ");
};

export const CopyHighlightStringButton: React.FC<{
  meId: FilmstundUserID;
  participants: SingleShowing_showing_adminPaymentDetails_attendees[];
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
