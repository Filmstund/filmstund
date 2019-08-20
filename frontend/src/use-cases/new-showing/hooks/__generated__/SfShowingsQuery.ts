/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SfShowingsQuery
// ====================================================

export interface SfShowingsQuery_movie_showings_screen {
  __typename: "FilmstadenScreen";
  filmstadenId: string;
  name: string;
}

export interface SfShowingsQuery_movie_showings {
  __typename: "FilmstadenShowing";
  cinemaName: string | null;
  screen: SfShowingsQuery_movie_showings_screen | null;
  timeUtc: string | null;
  tags: string[];
}

export interface SfShowingsQuery_movie {
  __typename: "Movie";
  showings: SfShowingsQuery_movie_showings[];
}

export interface SfShowingsQuery {
  movie: SfShowingsQuery_movie | null;
}

export interface SfShowingsQueryVariables {
  movieId: any;
  city?: string | null;
}
