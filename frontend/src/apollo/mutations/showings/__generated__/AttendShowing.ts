/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PaymentOption } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AttendShowing
// ====================================================

export interface AttendShowing_attendShowing_participants_user {
  __typename: "User";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface AttendShowing_attendShowing_participants {
  __typename: "Participant";
  paymentType: string;
  user: AttendShowing_attendShowing_participants_user | null;
}

export interface AttendShowing_attendShowing {
  __typename: "Showing";
  id: any;
  participants: AttendShowing_attendShowing_participants[];
}

export interface AttendShowing {
  attendShowing: AttendShowing_attendShowing;
}

export interface AttendShowingVariables {
  showingId: any;
  paymentOption: PaymentOption;
}
