/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CreateShowingQuery
// ====================================================

export interface CreateShowingQuery_movie {
  __typename: "MovieDTO";
  id: any;
  title: string;
  poster: string | null;
  releaseDate: string;
}

export interface CreateShowingQuery_me {
  __typename: "UserDTO";
  id: any;
  nick: string | null;
  name: string | null;
}

export interface CreateShowingQuery_previousLocations {
  __typename: "LocationDTO";
  name: string;
}

export interface CreateShowingQuery_filmstadenCities {
  __typename: "FilmstadenCityAliasDTO";
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
