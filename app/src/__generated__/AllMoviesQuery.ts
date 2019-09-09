/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AllMoviesQuery
// ====================================================

export interface AllMoviesQuery_allMovies {
  __typename: "Movie";
  id: SeFilmUUID;
  poster: string | null;
  title: string;
  releaseDate: string;
  runtime: string;
  imdbId: SeFilmIMDbID | null;
}

export interface AllMoviesQuery {
  allMovies: AllMoviesQuery_allMovies[];
}
