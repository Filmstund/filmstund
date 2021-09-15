/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: EditShowing
// ====================================================

export interface EditShowing_me {
  __typename: "CurrentUser";
  id: SeFilmUserID;
}

export interface EditShowing_showing_location {
  __typename: "Location";
  name: string;
  cityAlias: string | null;
}

export interface EditShowing_showing_movie {
  __typename: "Movie";
  id: SeFilmUUID;
  title: string;
  poster: string | null;
}

export interface EditShowing_showing_admin {
  __typename: "User";
  id: SeFilmUserID;
  name: string | null;
  nick: string | null;
}

export interface EditShowing_showing_payToUser {
  __typename: "User";
  id: SeFilmUserID;
}

export interface EditShowing_showing {
  __typename: "Showing";
  id: SeFilmUUID;
  webId: SeFilmBase64ID;
  slug: string;
  date: string;
  time: string;
  location: EditShowing_showing_location;
  ticketsBought: boolean;
  movie: EditShowing_showing_movie;
  admin: EditShowing_showing_admin;
  price: SeFilmSEK | null;
  private: boolean;
  filmstadenRemoteEntityId: string | null;
  payToUser: EditShowing_showing_payToUser;
}

export interface EditShowing_previousLocations {
  __typename: "Location";
  name: string;
}

export interface EditShowing {
  me: EditShowing_me;
  showing: EditShowing_showing | null;
  previousLocations: EditShowing_previousLocations[];
}

export interface EditShowingVariables {
  webId: SeFilmBase64ID;
}
