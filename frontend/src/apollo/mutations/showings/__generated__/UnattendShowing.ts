/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UnattendShowing
// ====================================================

export interface UnattendShowing_unattendShowing_participants_user {
  __typename: "User";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface UnattendShowing_unattendShowing_participants {
  __typename: "Participant";
  paymentType: string;
  user: UnattendShowing_unattendShowing_participants_user | null;
}

export interface UnattendShowing_unattendShowing {
  __typename: "Showing";
  id: any;
  participants: UnattendShowing_unattendShowing_participants[];
}

export interface UnattendShowing {
  unattendShowing: UnattendShowing_unattendShowing;
}

export interface UnattendShowingVariables {
  showingId: any;
}
