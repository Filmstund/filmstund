/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingNeue
// ====================================================

export interface ShowingNeue_movie {
  __typename: "Movie";
  id: any;
  poster: string | null;
  title: string;
}

export interface ShowingNeue_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface ShowingNeue_participants_user {
  __typename: "User";
  id: any;
  avatar: string | null;
}

export interface ShowingNeue_participants {
  __typename: "Participant";
  user: ShowingNeue_participants_user | null;
}

export interface ShowingNeue {
  __typename: "Showing";
  id: any;
  date: string;
  time: string;
  webId: any;
  slug: string;
  movie: ShowingNeue_movie;
  myTickets: ShowingNeue_myTickets[] | null;
  participants: ShowingNeue_participants[];
}
