/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UnattendShowing
// ====================================================

export interface UnattendShowing_unattendShowing_attendees_userInfo {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface UnattendShowing_unattendShowing_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: UnattendShowing_unattendShowing_attendees_userInfo;
}

export interface UnattendShowing_unattendShowing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  attendees: UnattendShowing_unattendShowing_attendees[];
}

export interface UnattendShowing {
  unattendShowing: UnattendShowing_unattendShowing;
}

export interface UnattendShowingVariables {
  showingId: FilmstundShowingID;
}
