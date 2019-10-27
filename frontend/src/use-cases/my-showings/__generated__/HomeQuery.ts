/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: HomeQuery
// ====================================================

export interface HomeQuery_showings_movie {
  __typename: "MovieDTO";
  id: any;
  poster: string | null;
  title: string;
}

export interface HomeQuery_showings_myTickets {
  __typename: "TicketDTO";
  id: string;
}

export interface HomeQuery_showings_attendees_userInfo {
  __typename: "PublicUserDTO";
  id: any;
  avatar: string | null;
}

export interface HomeQuery_showings_attendees {
  __typename: "PublicAttendeeDTO";
  userInfo: HomeQuery_showings_attendees_userInfo;
  userId: any;
}

export interface HomeQuery_showings_admin {
  __typename: "PublicUserDTO";
  id: any;
}

export interface HomeQuery_showings {
  __typename: "ShowingDTO";
  id: any;
  date: string;
  time: string;
  webId: any;
  slug: string;
  movie: HomeQuery_showings_movie;
  myTickets: HomeQuery_showings_myTickets[] | null;
  attendees: HomeQuery_showings_attendees[];
  admin: HomeQuery_showings_admin;
}

export interface HomeQuery_me {
  __typename: "UserDTO";
  id: any;
}

export interface HomeQuery {
  showings: HomeQuery_showings[];
  me: HomeQuery_me;
}
