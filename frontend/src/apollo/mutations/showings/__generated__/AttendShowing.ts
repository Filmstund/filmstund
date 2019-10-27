/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PaymentOption } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AttendShowing
// ====================================================

export interface AttendShowing_attendShowing_attendees_userInfo {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface AttendShowing_attendShowing_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: AttendShowing_attendShowing_attendees_userInfo;
}

export interface AttendShowing_attendShowing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  attendees: AttendShowing_attendShowing_attendees[];
}

export interface AttendShowing {
  attendShowing: AttendShowing_attendShowing;
}

export interface AttendShowingVariables {
  showingId: FilmstundShowingID;
  paymentOption: PaymentOption;
}
