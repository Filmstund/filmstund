/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingQuery
// ====================================================

export interface ShowingQuery_showing_admin {
  __typename: "User";
  id: SeFilmUserID;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
}

export interface ShowingQuery_showing_location {
  __typename: "Location";
  name: string;
}

export interface ShowingQuery_showing_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
  imdbId: SeFilmIMDbID | null;
}

export interface ShowingQuery_showing_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface ShowingQuery_showing_participants_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  id: SeFilmUserID;
  lastName: string | null;
  nick: string | null;
}

export interface ShowingQuery_showing_participants {
  __typename: "Participant";
  user: ShowingQuery_showing_participants_user | null;
}

export interface ShowingQuery_showing {
  __typename: "Showing";
  id: SeFilmUUID;
  date: string;
  time: string;
  ticketsBought: boolean;
  admin: ShowingQuery_showing_admin;
  location: ShowingQuery_showing_location;
  movie: ShowingQuery_showing_movie;
  myTickets: ShowingQuery_showing_myTickets[] | null;
  participants: ShowingQuery_showing_participants[];
}

export interface ShowingQuery {
  showing: ShowingQuery_showing | null;
}

export interface ShowingQueryVariables {
  showingId: SeFilmUUID;
}
