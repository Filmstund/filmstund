/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PaymentOption } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AttendShowing
// ====================================================

export interface AttendShowing_attendShowing_admin {
  __typename: "User";
  id: SeFilmUserID;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
}

export interface AttendShowing_attendShowing_location {
  __typename: "Location";
  name: string;
}

export interface AttendShowing_attendShowing_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
  imdbId: SeFilmIMDbID | null;
}

export interface AttendShowing_attendShowing_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface AttendShowing_attendShowing_participants_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  id: SeFilmUserID;
  lastName: string | null;
  nick: string | null;
}

export interface AttendShowing_attendShowing_participants {
  __typename: "Participant";
  user: AttendShowing_attendShowing_participants_user | null;
}

export interface AttendShowing_attendShowing {
  __typename: "Showing";
  id: SeFilmUUID;
  date: string;
  time: string;
  ticketsBought: boolean;
  admin: AttendShowing_attendShowing_admin;
  location: AttendShowing_attendShowing_location;
  movie: AttendShowing_attendShowing_movie;
  myTickets: AttendShowing_attendShowing_myTickets[] | null;
  participants: AttendShowing_attendShowing_participants[];
}

export interface AttendShowing {
  attendShowing: AttendShowing_attendShowing;
}

export interface AttendShowingVariables {
  showingId: SeFilmUUID;
  paymentOption: PaymentOption;
}
