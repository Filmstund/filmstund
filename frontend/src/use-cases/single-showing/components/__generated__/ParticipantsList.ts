/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ParticipantsList
// ====================================================

export interface ParticipantsList_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
  phone: string | null;
  id: SeFilmUserID;
}

export interface ParticipantsList {
  __typename: "Participant";
  user: ParticipantsList_user | null;
}
