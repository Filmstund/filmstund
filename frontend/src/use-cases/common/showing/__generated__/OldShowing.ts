/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: OldShowing
// ====================================================

export interface OldShowing_location {
  __typename: "LocationDTO";
  name: string;
}

export interface OldShowing_movie {
  __typename: "MovieDTO";
  id: any;
  title: string;
  poster: string | null;
}

export interface OldShowing_admin {
  __typename: "PublicUserDTO";
  id: any;
  name: string | null;
  nick: string | null;
}

export interface OldShowing {
  __typename: "ShowingDTO";
  id: any;
  webId: any;
  slug: string;
  date: string;
  time: string;
  location: OldShowing_location | null;
  ticketsBought: boolean;
  movie: OldShowing_movie;
  admin: OldShowing_admin;
}
