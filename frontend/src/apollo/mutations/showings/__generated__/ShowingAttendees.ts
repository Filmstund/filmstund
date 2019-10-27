/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingAttendees
// ====================================================

export interface ShowingAttendees_attendees_userInfo {
  __typename: "PublicUserDTO";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface ShowingAttendees_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: ShowingAttendees_attendees_userInfo;
}

export interface ShowingAttendees {
  __typename: "ShowingDTO";
  id: any;
  attendees: ShowingAttendees_attendees[];
}
