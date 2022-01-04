import {
  ParticipantsListFragment,
  SingleShowingQuery,
} from "../../../__generated__/types";

export const userIsAdmin = (
  showing: SingleShowingQuery["showing"],
  user: SingleShowingQuery["me"]
): boolean => {
  return showing?.admin.id === user.id;
};

export const userIsParticipating = (
  participants: ParticipantsListFragment[],
  user: SingleShowingQuery["me"]
): boolean => {
  return participants.some((p) => !!p.userInfo && p.userInfo.id === user.id);
};
