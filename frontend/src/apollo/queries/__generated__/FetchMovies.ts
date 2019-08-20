/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FetchMovies
// ====================================================

export interface FetchMovies_fetchNewMoviesFromFilmstaden {
  __typename: "Movie";
  id: any;
  poster: string | null;
  title: string;
  releaseDate: string;
  popularity: number;
}

export interface FetchMovies {
  /**
   * Fetch any new movies from Filmstaden, returns the movies that were added
   */
  fetchNewMoviesFromFilmstaden: FetchMovies_fetchNewMoviesFromFilmstaden[] | null;
}
