/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingAdmin
// ====================================================

export interface ShowingAdmin_cinemaScreen {
  __typename: "CinemaScreenDTO";
  id: string;
  name: string;
}

export interface ShowingAdmin_payToUser {
  __typename: "PublicUserDTO";
  id: any;
}

export interface ShowingAdmin_adminPaymentDetails_attendees_giftCertificateUsed {
  __typename: "GiftCertificateDTO";
  number: string;
}

export interface ShowingAdmin_adminPaymentDetails_attendees_user {
  __typename: "PublicUserDTO";
  id: any;
  nick: string | null;
  name: string | null;
  phone: string | null;
}

export interface ShowingAdmin_adminPaymentDetails_attendees {
  __typename: "AttendeeDTO";
  hasPaid: boolean;
  amountOwed: any;
  filmstadenMembershipId: string | null;
  giftCertificateUsed: ShowingAdmin_adminPaymentDetails_attendees_giftCertificateUsed | null;
  user: ShowingAdmin_adminPaymentDetails_attendees_user;
}

export interface ShowingAdmin_adminPaymentDetails {
  __typename: "AdminPaymentDetailsDTO";
  filmstadenBuyLink: string | null;
  attendees: ShowingAdmin_adminPaymentDetails_attendees[];
}

export interface ShowingAdmin {
  __typename: "ShowingDTO";
  id: any;
  price: any | null;
  filmstadenShowingId: string | null;
  cinemaScreen: ShowingAdmin_cinemaScreen | null;
  payToUser: ShowingAdmin_payToUser;
  adminPaymentDetails: ShowingAdmin_adminPaymentDetails | null;
}
