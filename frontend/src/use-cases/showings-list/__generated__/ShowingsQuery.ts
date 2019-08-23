/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingsQuery
// ====================================================

export interface ShowingsQuery_showings_movie {
  __typename: "Movie";
  id: any;
  poster: string | null;
  title: string;
}

export interface ShowingsQuery_showings_myTickets {
  __typename: "Ticket";
  id: string;
}

export interface ShowingsQuery_showings_participants_user {
  __typename: "User";
  id: any;
  avatar: string | null;
}

export interface ShowingsQuery_showings_participants {
  __typename: "Participant";
  user: ShowingsQuery_showings_participants_user | null;
}

export interface ShowingsQuery_showings {
  __typename: "Showing";
  id: any;
  date: string;
  time: string;
  webId: any;
  slug: string;
  movie: ShowingsQuery_showings_movie;
  myTickets: ShowingsQuery_showings_myTickets[] | null;
  participants: ShowingsQuery_showings_participants[];
}

export interface ShowingsQuery {
  showings: ShowingsQuery_showings[];
}
