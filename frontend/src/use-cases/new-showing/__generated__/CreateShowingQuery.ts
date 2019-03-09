/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CreateShowingQuery
// ====================================================

export interface CreateShowingQuery_movie_sfShowings_screen {
  __typename: "SfScreen";
  sfId: string;
  name: string;
}

export interface CreateShowingQuery_movie_sfShowings {
  __typename: "SfShowing";
  cinemaName: string | null;
  screen: CreateShowingQuery_movie_sfShowings_screen | null;
  timeUtc: string | null;
  tags: string[];
}

export interface CreateShowingQuery_movie {
  __typename: "Movie";
  id: any;
  title: string;
  poster: string | null;
  releaseDate: string;
  sfShowings: CreateShowingQuery_movie_sfShowings[];
}

export interface CreateShowingQuery_me {
  __typename: "CurrentUser";
  id: any;
  nick: string | null;
}

export interface CreateShowingQuery_previousLocations {
  __typename: "Location";
  name: string;
}

export interface CreateShowingQuery_sfCities {
  __typename: "SfCity";
  name: string;
  alias: string;
}

export interface CreateShowingQuery {
  movie: CreateShowingQuery_movie | null;
  me: CreateShowingQuery_me;
  previousLocations: CreateShowingQuery_previousLocations[];
  sfCities: CreateShowingQuery_sfCities[];
}

export interface CreateShowingQueryVariables {
  movieId: any;
  city?: string | null;
}
