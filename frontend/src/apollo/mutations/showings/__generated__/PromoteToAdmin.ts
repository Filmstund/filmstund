/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PromoteToAdmin
// ====================================================

export interface PromoteToAdmin_promoteToAdmin_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface PromoteToAdmin_promoteToAdmin_payToUser {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface PromoteToAdmin_promoteToAdmin_attendeePaymentDetails_payTo {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface PromoteToAdmin_promoteToAdmin_attendeePaymentDetails {
  __typename: "AttendeePaymentDetailsDTO";
  payTo: PromoteToAdmin_promoteToAdmin_attendeePaymentDetails_payTo;
  swishLink: string | null;
  hasPaid: boolean;
  amountOwed: FilmstundSEK;
}

export interface PromoteToAdmin_promoteToAdmin {
  __typename: "ShowingDTO";
  admin: PromoteToAdmin_promoteToAdmin_admin;
  payToUser: PromoteToAdmin_promoteToAdmin_payToUser;
  attendeePaymentDetails: PromoteToAdmin_promoteToAdmin_attendeePaymentDetails | null;
}

export interface PromoteToAdmin {
  promoteToAdmin: PromoteToAdmin_promoteToAdmin;
}

export interface PromoteToAdminVariables {
  showingId: FilmstundShowingID;
  userId: FilmstundUserID;
}
