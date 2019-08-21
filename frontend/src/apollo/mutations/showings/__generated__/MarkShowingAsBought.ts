/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: MarkShowingAsBought
// ====================================================

export interface MarkShowingAsBought_markAsBought_payToUser {
  __typename: "User";
  id: any;
}

export interface MarkShowingAsBought_markAsBought_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface MarkShowingAsBought_markAsBought_attendeePaymentDetails_payTo {
  __typename: "User";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface MarkShowingAsBought_markAsBought_attendeePaymentDetails {
  __typename: "AttendeePaymentDetails";
  payTo: MarkShowingAsBought_markAsBought_attendeePaymentDetails_payTo;
  swishLink: string | null;
  hasPaid: boolean;
  amountOwed: any;
}

export interface MarkShowingAsBought_markAsBought_adminPaymentDetails_participantPaymentInfos_user {
  __typename: "User";
  id: any;
  nick: string | null;
  name: string | null;
  phone: string | null;
}

export interface MarkShowingAsBought_markAsBought_adminPaymentDetails_participantPaymentInfos {
  __typename: "ParticipantPaymentInfo";
  id: any;
  hasPaid: boolean;
  amountOwed: any;
  user: MarkShowingAsBought_markAsBought_adminPaymentDetails_participantPaymentInfos_user;
}

export interface MarkShowingAsBought_markAsBought_adminPaymentDetails {
  __typename: "AdminPaymentDetails";
  participantPaymentInfos: MarkShowingAsBought_markAsBought_adminPaymentDetails_participantPaymentInfos[];
}

export interface MarkShowingAsBought_markAsBought {
  __typename: "Showing";
  id: any;
  ticketsBought: boolean;
  price: any | null;
  private: boolean;
  payToUser: MarkShowingAsBought_markAsBought_payToUser;
  expectedBuyDate: string | null;
  time: string;
  myTickets: MarkShowingAsBought_markAsBought_myTickets[] | null;
  attendeePaymentDetails: MarkShowingAsBought_markAsBought_attendeePaymentDetails | null;
  adminPaymentDetails: MarkShowingAsBought_markAsBought_adminPaymentDetails | null;
}

export interface MarkShowingAsBought {
  markAsBought: MarkShowingAsBought_markAsBought;
}

export interface MarkShowingAsBoughtVariables {
  showingId: any;
  price: any;
}
