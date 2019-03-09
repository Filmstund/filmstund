/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: BoughtShowing
// ====================================================

export interface BoughtShowing_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface BoughtShowing_attendeePaymentDetails_payTo {
  __typename: "User";
  id: any;
  phone: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
}

export interface BoughtShowing_attendeePaymentDetails {
  __typename: "AttendeePaymentDetails";
  amountOwed: any;
  swishLink: string | null;
  hasPaid: boolean;
  payTo: BoughtShowing_attendeePaymentDetails_payTo;
}

export interface BoughtShowing {
  __typename: "Showing";
  myTickets: BoughtShowing_myTickets[] | null;
  attendeePaymentDetails: BoughtShowing_attendeePaymentDetails | null;
}
