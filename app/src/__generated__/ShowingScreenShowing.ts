/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingScreenShowing
// ====================================================

export interface ShowingScreenShowing_admin {
  __typename: "User";
  id: SeFilmUserID;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
}

export interface ShowingScreenShowing_location {
  __typename: "Location";
  name: string;
}

export interface ShowingScreenShowing_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
  imdbId: SeFilmIMDbID | null;
}

export interface ShowingScreenShowing_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface ShowingScreenShowing_participants_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  id: SeFilmUserID;
  lastName: string | null;
  nick: string | null;
}

export interface ShowingScreenShowing_participants {
  __typename: "Participant";
  user: ShowingScreenShowing_participants_user | null;
}

export interface ShowingScreenShowing {
  __typename: "Showing";
  id: SeFilmUUID;
  date: string;
  time: string;
  admin: ShowingScreenShowing_admin;
  location: ShowingScreenShowing_location;
  movie: ShowingScreenShowing_movie;
  myTickets: ShowingScreenShowing_myTickets[] | null;
  participants: ShowingScreenShowing_participants[];
}
