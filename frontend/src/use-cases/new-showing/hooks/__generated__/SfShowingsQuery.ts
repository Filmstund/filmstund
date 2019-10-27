/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SfShowingsQuery
// ====================================================

export interface SfShowingsQuery_movie_showings_screen {
  __typename: "FilmstadenLiteScreenDTO";
  filmstadenId: string;
  name: string;
}

export interface SfShowingsQuery_movie_showings {
  __typename: "FilmstadenShowingDTO";
  cinemaName: string;
  screen: SfShowingsQuery_movie_showings_screen;
  timeUtc: string;
  tags: string[];
  filmstadenRemoteEntityId: string;
}

export interface SfShowingsQuery_movie {
  __typename: "MovieDTO";
  showings: SfShowingsQuery_movie_showings[];
}

export interface SfShowingsQuery {
  movie: SfShowingsQuery_movie | null;
}

export interface SfShowingsQueryVariables {
  movieId: FilmstundMovieID;
  city?: string | null;
}
