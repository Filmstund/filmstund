/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NewShowingQuery
// ====================================================

export interface NewShowingQuery_movies {
  __typename: "Movie";
  id: SeFilmUUID;
  poster: string | null;
  title: string;
  releaseDate: string;
  popularity: number;
}

export interface NewShowingQuery {
  movies: NewShowingQuery_movies[];
}
