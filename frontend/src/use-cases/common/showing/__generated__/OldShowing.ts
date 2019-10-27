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
  id: FilmstundMovieID;
  title: string;
  poster: string | null;
}

export interface OldShowing_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  name: string | null;
  nick: string | null;
}

export interface OldShowing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  webId: FilmstundBase64ID;
  slug: string;
  date: string;
  time: string;
  location: OldShowing_location;
  ticketsBought: boolean;
  movie: OldShowing_movie;
  admin: OldShowing_admin;
}
