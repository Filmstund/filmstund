/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PaymentType } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: MarkShowingAsBought
// ====================================================

export interface MarkShowingAsBought_markAsBought_payToUser {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface MarkShowingAsBought_markAsBought_myTickets {
  __typename: "TicketDTO";
  id: string;
}

export interface MarkShowingAsBought_markAsBought_attendeePaymentDetails_payTo {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface MarkShowingAsBought_markAsBought_attendeePaymentDetails {
  __typename: "AttendeePaymentDetailsDTO";
  payTo: MarkShowingAsBought_markAsBought_attendeePaymentDetails_payTo;
  swishLink: string | null;
  hasPaid: boolean;
  amountOwed: FilmstundSEK;
}

export interface MarkShowingAsBought_markAsBought_adminPaymentDetails_attendees {
  __typename: "AttendeeDTO";
  userId: FilmstundUserID;
  type: PaymentType;
  hasPaid: boolean;
  amountOwed: FilmstundSEK;
}

export interface MarkShowingAsBought_markAsBought_adminPaymentDetails {
  __typename: "AdminPaymentDetailsDTO";
  attendees: MarkShowingAsBought_markAsBought_adminPaymentDetails_attendees[];
}

export interface MarkShowingAsBought_markAsBought {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  ticketsBought: boolean;
  price: FilmstundSEK | null;
  payToUser: MarkShowingAsBought_markAsBought_payToUser;
  date: string;
  time: string;
  myTickets: MarkShowingAsBought_markAsBought_myTickets[] | null;
  attendeePaymentDetails: MarkShowingAsBought_markAsBought_attendeePaymentDetails | null;
  adminPaymentDetails: MarkShowingAsBought_markAsBought_adminPaymentDetails | null;
}

export interface MarkShowingAsBought {
  markAsBought: MarkShowingAsBought_markAsBought;
}

export interface MarkShowingAsBoughtVariables {
  showingId: FilmstundShowingID;
  price: FilmstundSEK;
}
