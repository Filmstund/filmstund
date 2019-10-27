/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTO_Status } from "./../../../__generated__/globalTypes";

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
  id: FilmstundUserID;
}

export interface ShowingAdmin_adminPaymentDetails_attendees_giftCertificateUsed {
  __typename: "GiftCertificateDTO";
  number: string;
  status: GiftCertificateDTO_Status;
}

export interface ShowingAdmin_adminPaymentDetails_attendees_user {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
}

export interface ShowingAdmin_adminPaymentDetails_attendees {
  __typename: "AttendeeDTO";
  userId: FilmstundUserID;
  hasPaid: boolean;
  amountOwed: FilmstundSEK;
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
  id: FilmstundShowingID;
  price: FilmstundSEK | null;
  filmstadenShowingId: string | null;
  cinemaScreen: ShowingAdmin_cinemaScreen | null;
  payToUser: ShowingAdmin_payToUser;
  adminPaymentDetails: ShowingAdmin_adminPaymentDetails | null;
}
