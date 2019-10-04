/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UnattendShowing
// ====================================================

export interface UnattendShowing_unattendShowing_admin {
  __typename: "User";
  id: SeFilmUserID;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
}

export interface UnattendShowing_unattendShowing_location {
  __typename: "Location";
  name: string;
}

export interface UnattendShowing_unattendShowing_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
  imdbId: SeFilmIMDbID | null;
}

export interface UnattendShowing_unattendShowing_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface UnattendShowing_unattendShowing_participants_user {
  __typename: "User";
  avatar: string | null;
  firstName: string | null;
  id: SeFilmUserID;
  lastName: string | null;
  nick: string | null;
}

export interface UnattendShowing_unattendShowing_participants {
  __typename: "Participant";
  user: UnattendShowing_unattendShowing_participants_user | null;
}

export interface UnattendShowing_unattendShowing {
  __typename: "Showing";
  id: SeFilmUUID;
  date: string;
  time: string;
  admin: UnattendShowing_unattendShowing_admin;
  location: UnattendShowing_unattendShowing_location;
  movie: UnattendShowing_unattendShowing_movie;
  myTickets: UnattendShowing_unattendShowing_myTickets[] | null;
  participants: UnattendShowing_unattendShowing_participants[];
}

export interface UnattendShowing {
  unattendShowing: UnattendShowing_unattendShowing;
}

export interface UnattendShowingVariables {
  showingId: SeFilmUUID;
}
