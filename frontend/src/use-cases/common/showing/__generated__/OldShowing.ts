/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: OldShowing
// ====================================================

export interface OldShowing_location {
  __typename: "Location";
  name: string;
}

export interface OldShowing_movie {
  __typename: "Movie";
  id: any;
  title: string;
  poster: string | null;
}

export interface OldShowing_admin {
  __typename: "User";
  id: any;
  name: string | null;
  nick: string | null;
}

export interface OldShowing {
  __typename: "Showing";
  id: any;
  webId: any;
  slug: string;
  date: string;
  time: string;
  location: OldShowing_location;
  ticketsBought: boolean;
  movie: OldShowing_movie;
  admin: OldShowing_admin;
}
