/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingsQuery
// ====================================================

export interface ShowingsQuery_showings_movie {
  __typename: "MovieDTO";
  id: any;
  poster: string | null;
  title: string;
}

export interface ShowingsQuery_showings_myTickets {
  __typename: "TicketDTO";
  id: string;
}

export interface ShowingsQuery_showings_attendees_userInfo {
  __typename: "PublicUserDTO";
  id: any;
  avatar: string | null;
}

export interface ShowingsQuery_showings_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: ShowingsQuery_showings_attendees_userInfo;
}

export interface ShowingsQuery_showings {
  __typename: "ShowingDTO";
  id: any;
  date: string;
  time: string;
  webId: any;
  slug: string;
  movie: ShowingsQuery_showings_movie;
  myTickets: ShowingsQuery_showings_myTickets[] | null;
  attendees: ShowingsQuery_showings_attendees[];
}

export interface ShowingsQuery {
  showings: ShowingsQuery_showings[];
}
