/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingsByMovieQuery
// ====================================================

export interface ShowingsByMovieQuery_me {
  __typename: "CurrentUser";
  id: SeFilmUserID;
}

export interface ShowingsByMovieQuery_publicShowings_admin {
  __typename: "User";
  id: SeFilmUserID;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
}

export interface ShowingsByMovieQuery_publicShowings_location {
  __typename: "Location";
  name: string;
}

export interface ShowingsByMovieQuery_publicShowings_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
  imdbId: SeFilmIMDbID | null;
  releaseDate: string;
  runtime: string;
}

export interface ShowingsByMovieQuery_publicShowings_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface ShowingsByMovieQuery_publicShowings_participants_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  id: SeFilmUserID;
  lastName: string | null;
  nick: string | null;
}

export interface ShowingsByMovieQuery_publicShowings_participants {
  __typename: "Participant";
  user: ShowingsByMovieQuery_publicShowings_participants_user | null;
}

export interface ShowingsByMovieQuery_publicShowings {
  __typename: "Showing";
  id: SeFilmUUID;
  date: string;
  time: string;
  admin: ShowingsByMovieQuery_publicShowings_admin;
  location: ShowingsByMovieQuery_publicShowings_location;
  movie: ShowingsByMovieQuery_publicShowings_movie;
  myTickets: ShowingsByMovieQuery_publicShowings_myTickets[] | null;
  participants: ShowingsByMovieQuery_publicShowings_participants[];
}

export interface ShowingsByMovieQuery {
  me: ShowingsByMovieQuery_me;
  publicShowings: ShowingsByMovieQuery_publicShowings[];
}
