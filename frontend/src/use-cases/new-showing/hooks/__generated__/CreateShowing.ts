/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CreateShowingDTOInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateShowing
// ====================================================

export interface CreateShowing_showing_location {
  __typename: "LocationDTO";
  name: string;
}

export interface CreateShowing_showing_movie {
  __typename: "MovieDTO";
  id: any;
  title: string;
  poster: string | null;
}

export interface CreateShowing_showing_admin {
  __typename: "PublicUserDTO";
  id: any;
  name: string | null;
  nick: string | null;
}

export interface CreateShowing_showing {
  __typename: "ShowingDTO";
  id: any;
  webId: any;
  slug: string;
  date: string;
  time: string;
  location: CreateShowing_showing_location | null;
  ticketsBought: boolean;
  movie: CreateShowing_showing_movie;
  admin: CreateShowing_showing_admin;
}

export interface CreateShowing {
  showing: CreateShowing_showing;
}

export interface CreateShowingVariables {
  showing: CreateShowingDTOInput;
}
