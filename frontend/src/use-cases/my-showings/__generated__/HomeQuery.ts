/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: HomeQuery
// ====================================================

export interface HomeQuery_showings_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  poster: string | null;
  title: string;
}

export interface HomeQuery_showings_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface HomeQuery_showings_participants_user {
  __typename: "User";
  id: SeFilmUserID;
  avatar: string | null;
}

export interface HomeQuery_showings_participants {
  __typename: "Participant";
  user: HomeQuery_showings_participants_user | null;
}

export interface HomeQuery_showings_admin {
  __typename: "User";
  id: SeFilmUserID;
}

export interface HomeQuery_showings {
  __typename: "Showing";
  id: SeFilmUUID;
  date: string;
  time: string;
  webId: SeFilmBase64ID;
  slug: string;
  movie: HomeQuery_showings_movie;
  myTickets: HomeQuery_showings_myTickets[] | null;
  participants: HomeQuery_showings_participants[];
  admin: HomeQuery_showings_admin;
}

export interface HomeQuery_me {
  __typename: "CurrentUser";
  id: SeFilmUserID;
}

export interface HomeQuery {
  showings: HomeQuery_showings[];
  me: HomeQuery_me;
}
