/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingParticipant
// ====================================================

export interface ShowingParticipant_participants_user {
  __typename: "User";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface ShowingParticipant_participants {
  __typename: "Participant";
  paymentType: string;
  user: ShowingParticipant_participants_user | null;
}

export interface ShowingParticipant {
  __typename: "Showing";
  id: any;
  participants: ShowingParticipant_participants[];
}
