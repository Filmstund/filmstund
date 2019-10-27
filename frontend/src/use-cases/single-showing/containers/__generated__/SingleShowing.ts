/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTO_Status } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: SingleShowing
// ====================================================

export interface SingleShowing_me_giftCertificates {
  __typename: "GiftCertificateDTO";
  expiresAt: FilmstundLocalDate;
  number: string;
  status: GiftCertificateDTO_Status;
}

export interface SingleShowing_me {
  __typename: "UserDTO";
  giftCertificates: SingleShowing_me_giftCertificates[];
  id: FilmstundUserID;
}

export interface SingleShowing_showing_location {
  __typename: "LocationDTO";
  name: string;
}

export interface SingleShowing_showing_movie {
  __typename: "MovieDTO";
  id: FilmstundMovieID;
  title: string;
  poster: string | null;
  imdbId: FilmstundIMDbID | null;
}

export interface SingleShowing_showing_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  name: string | null;
  nick: string | null;
}

export interface SingleShowing_showing_cinemaScreen {
  __typename: "CinemaScreenDTO";
  id: string;
  name: string;
}

export interface SingleShowing_showing_payToUser {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface SingleShowing_showing_adminPaymentDetails_attendees_giftCertificateUsed {
  __typename: "GiftCertificateDTO";
  number: string;
  status: GiftCertificateDTO_Status;
}

export interface SingleShowing_showing_adminPaymentDetails_attendees_user {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
}

export interface SingleShowing_showing_adminPaymentDetails_attendees {
  __typename: "AttendeeDTO";
  userId: FilmstundUserID;
  hasPaid: boolean;
  amountOwed: FilmstundSEK;
  filmstadenMembershipId: string | null;
  giftCertificateUsed: SingleShowing_showing_adminPaymentDetails_attendees_giftCertificateUsed | null;
  user: SingleShowing_showing_adminPaymentDetails_attendees_user;
}

export interface SingleShowing_showing_adminPaymentDetails {
  __typename: "AdminPaymentDetailsDTO";
  filmstadenBuyLink: string | null;
  attendees: SingleShowing_showing_adminPaymentDetails_attendees[];
}

export interface SingleShowing_showing_myTickets {
  __typename: "TicketDTO";
  id: string;
}

export interface SingleShowing_showing_attendeePaymentDetails_payTo {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  phone: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
}

export interface SingleShowing_showing_attendeePaymentDetails {
  __typename: "AttendeePaymentDetailsDTO";
  amountOwed: FilmstundSEK;
  swishLink: string | null;
  hasPaid: boolean;
  payTo: SingleShowing_showing_attendeePaymentDetails_payTo;
}

export interface SingleShowing_showing_attendees_userInfo {
  __typename: "PublicUserDTO";
  avatar: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
  phone: string | null;
  id: FilmstundUserID;
}

export interface SingleShowing_showing_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: SingleShowing_showing_attendees_userInfo;
}

export interface SingleShowing_showing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  webId: FilmstundBase64ID;
  slug: string;
  date: string;
  time: string;
  location: SingleShowing_showing_location;
  ticketsBought: boolean;
  movie: SingleShowing_showing_movie;
  admin: SingleShowing_showing_admin;
  price: FilmstundSEK | null;
  filmstadenShowingId: string | null;
  cinemaScreen: SingleShowing_showing_cinemaScreen | null;
  payToUser: SingleShowing_showing_payToUser;
  adminPaymentDetails: SingleShowing_showing_adminPaymentDetails | null;
  myTickets: SingleShowing_showing_myTickets[];
  attendeePaymentDetails: SingleShowing_showing_attendeePaymentDetails | null;
  attendees: SingleShowing_showing_attendees[];
}

export interface SingleShowing {
  me: SingleShowing_me;
  showing: SingleShowing_showing | null;
}

export interface SingleShowingVariables {
  webId: FilmstundBase64ID;
}
