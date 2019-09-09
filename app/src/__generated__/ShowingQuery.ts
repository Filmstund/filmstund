/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingQuery
// ====================================================

export interface ShowingQuery_showing_movie {
  __typename: "Movie";
  title: string;
}

export interface ShowingQuery_showing_myTickets_seat {
  __typename: "Seat";
  number: number;
  row: number;
}

export interface ShowingQuery_showing_myTickets {
  __typename: "Ticket";
  customerType: string;
  barcode: string;
  id: string;
  screen: string;
  seat: ShowingQuery_showing_myTickets_seat;
  profileId: string | null;
}

export interface ShowingQuery_showing {
  __typename: "Showing";
  movie: ShowingQuery_showing_movie;
  myTickets: ShowingQuery_showing_myTickets[] | null;
}

export interface ShowingQuery {
  showing: ShowingQuery_showing | null;
}

export interface ShowingQueryVariables {
  showingId: SeFilmUUID;
}
