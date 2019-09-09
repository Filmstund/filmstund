/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingTicketsQuery
// ====================================================

export interface ShowingTicketsQuery_showing_location {
  __typename: "Location";
  name: string;
}

export interface ShowingTicketsQuery_showing_movie {
  __typename: "Movie";
  title: string;
}

export interface ShowingTicketsQuery_showing_myTickets_seat {
  __typename: "Seat";
  number: number;
  row: number;
}

export interface ShowingTicketsQuery_showing_myTickets {
  __typename: "Ticket";
  customerType: string;
  barcode: string;
  id: string;
  screen: string;
  seat: ShowingTicketsQuery_showing_myTickets_seat;
  profileId: string | null;
}

export interface ShowingTicketsQuery_showing {
  __typename: "Showing";
  date: string;
  time: string;
  location: ShowingTicketsQuery_showing_location;
  movie: ShowingTicketsQuery_showing_movie;
  myTickets: ShowingTicketsQuery_showing_myTickets[] | null;
}

export interface ShowingTicketsQuery {
  showing: ShowingTicketsQuery_showing | null;
}

export interface ShowingTicketsQueryVariables {
  showingId: SeFilmUUID;
}
