/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: EditShowing
// ====================================================

export interface EditShowing_me {
  __typename: "UserDTO";
  id: FilmstundUserID;
}

export interface EditShowing_showing_location {
  __typename: "LocationDTO";
  name: string;
  cityAlias: string | null;
}

export interface EditShowing_showing_movie {
  __typename: "MovieDTO";
  id: FilmstundMovieID;
  title: string;
  poster: string | null;
}

export interface EditShowing_showing_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
  name: string | null;
  nick: string | null;
}

export interface EditShowing_showing_payToUser {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface EditShowing_showing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  webId: FilmstundBase64ID;
  slug: string;
  date: string;
  time: string;
  location: EditShowing_showing_location;
  ticketsBought: boolean;
  movie: EditShowing_showing_movie;
  admin: EditShowing_showing_admin;
  price: FilmstundSEK | null;
  filmstadenShowingId: string | null;
  payToUser: EditShowing_showing_payToUser;
}

export interface EditShowing_previousLocations {
  __typename: "LocationDTO";
  name: string;
}

export interface EditShowing {
  me: EditShowing_me;
  showing: EditShowing_showing | null;
  previousLocations: EditShowing_previousLocations[];
}

export interface EditShowingVariables {
  webId: FilmstundBase64ID;
}
