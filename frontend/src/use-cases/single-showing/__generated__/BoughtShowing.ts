/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: BoughtShowing
// ====================================================

export interface BoughtShowing_myTickets {
  __typename: "TicketDTO";
  id: string;
}

export interface BoughtShowing_attendeePaymentDetails_payTo {
  __typename: "PublicUserDTO";
  id: any;
  phone: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
}

export interface BoughtShowing_attendeePaymentDetails {
  __typename: "AttendeePaymentDetailsDTO";
  amountOwed: any;
  swishLink: string | null;
  hasPaid: boolean;
  payTo: BoughtShowing_attendeePaymentDetails_payTo;
}

export interface BoughtShowing {
  __typename: "ShowingDTO";
  myTickets: BoughtShowing_myTickets[] | null;
  attendeePaymentDetails: BoughtShowing_attendeePaymentDetails | null;
}
