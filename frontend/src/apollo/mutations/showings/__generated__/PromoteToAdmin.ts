/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PromoteToAdmin
// ====================================================

export interface PromoteToAdmin_promoteToAdmin_admin {
  __typename: "User";
  id: any;
}

export interface PromoteToAdmin_promoteToAdmin_payToUser {
  __typename: "User";
  id: any;
}

export interface PromoteToAdmin_promoteToAdmin_attendeePaymentDetails_payTo {
  __typename: "User";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface PromoteToAdmin_promoteToAdmin_attendeePaymentDetails {
  __typename: "AttendeePaymentDetails";
  payTo: PromoteToAdmin_promoteToAdmin_attendeePaymentDetails_payTo;
  swishLink: string | null;
  hasPaid: boolean;
  amountOwed: any;
}

export interface PromoteToAdmin_promoteToAdmin {
  __typename: "Showing";
  admin: PromoteToAdmin_promoteToAdmin_admin;
  payToUser: PromoteToAdmin_promoteToAdmin_payToUser;
  attendeePaymentDetails: PromoteToAdmin_promoteToAdmin_attendeePaymentDetails | null;
}

export interface PromoteToAdmin {
  promoteToAdmin: PromoteToAdmin_promoteToAdmin;
}

export interface PromoteToAdminVariables {
  showingId: any;
  userId: any;
}
