import {
  SingleShowing_me,
  SingleShowing_showing, SingleShowing_showing_attendees,
} from "../containers/__generated__/SingleShowing";

export const userIsAdmin = (
  showing: SingleShowing_showing,
  user: SingleShowing_me
): boolean => {
  return showing.admin.id === user.id;
};

export const userIsParticipating = (
  participants: SingleShowing_showing_attendees[],
  user: SingleShowing_me
): boolean => {
  return participants.some(p => p.userInfo.id === user.id);
};
