/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CreateShowingQuery
// ====================================================

export interface CreateShowingQuery_movie {
  __typename: "Movie";
  id: any;
  title: string;
  poster: string | null;
  releaseDate: string;
}

export interface CreateShowingQuery_me {
  __typename: "CurrentUser";
  id: any;
  nick: string | null;
  name: string | null;
}

export interface CreateShowingQuery_previousLocations {
  __typename: "Location";
  name: string;
}

export interface CreateShowingQuery_filmstadenCities {
  __typename: "FilmstadenCity";
  name: string;
  alias: string;
}

export interface CreateShowingQuery {
  movie: CreateShowingQuery_movie | null;
  me: CreateShowingQuery_me;
  previousLocations: CreateShowingQuery_previousLocations[];
  filmstadenCities: CreateShowingQuery_filmstadenCities[];
}

export interface CreateShowingQueryVariables {
  movieId: any;
}
