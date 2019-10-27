/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingNeue
// ====================================================

export interface ShowingNeue_movie {
  __typename: "MovieDTO";
  id: any;
  poster: string | null;
  title: string;
}

export interface ShowingNeue_myTickets {
  __typename: "TicketDTO";
  id: string;
}

export interface ShowingNeue_attendees_userInfo {
  __typename: "PublicUserDTO";
  id: any;
  avatar: string | null;
}

export interface ShowingNeue_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: ShowingNeue_attendees_userInfo;
}

export interface ShowingNeue {
  __typename: "ShowingDTO";
  id: any;
  date: string;
  time: string;
  webId: any;
  slug: string;
  movie: ShowingNeue_movie;
  myTickets: ShowingNeue_myTickets[] | null;
  attendees: ShowingNeue_attendees[];
}
