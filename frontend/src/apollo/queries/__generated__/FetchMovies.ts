/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FetchMovies
// ====================================================

export interface FetchMovies_fetchNewMoviesFromSf {
  __typename: "Movie";
  id: any;
  poster: string | null;
  title: string;
  releaseDate: string;
  popularity: number;
}

export interface FetchMovies {
  /**
   * Fetch any new movies from SF, returns the movies that were added
   */
  fetchNewMoviesFromSf: FetchMovies_fetchNewMoviesFromSf[] | null;
}
