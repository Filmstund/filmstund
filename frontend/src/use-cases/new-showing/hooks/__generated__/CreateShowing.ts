/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CreateShowingInput } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateShowing
// ====================================================

export interface CreateShowing_showing_location {
  __typename: "Location";
  name: string;
}

export interface CreateShowing_showing_movie {
  __typename: "Movie";
  id: any;
  title: string;
  poster: string | null;
}

export interface CreateShowing_showing_admin {
  __typename: "User";
  id: any;
  name: string | null;
  nick: string | null;
}

export interface CreateShowing_showing {
  __typename: "Showing";
  id: any;
  webId: any;
  slug: string;
  date: string;
  time: string;
  location: CreateShowing_showing_location;
  ticketsBought: boolean;
  movie: CreateShowing_showing_movie;
  admin: CreateShowing_showing_admin;
}

export interface CreateShowing {
  showing: CreateShowing_showing;
}

export interface CreateShowingVariables {
  showing: CreateShowingInput;
}
