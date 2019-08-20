/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ShowingsSelectorQuery
// ====================================================

export interface ShowingsSelectorQuery_movie_showings_screen {
  __typename: "FilmstadenScreen";
  filmstadenId: string;
  name: string;
}

export interface ShowingsSelectorQuery_movie_showings {
  __typename: "FilmstadenShowing";
  cinemaName: string | null;
  screen: ShowingsSelectorQuery_movie_showings_screen | null;
  timeUtc: string | null;
  tags: string[];
}

export interface ShowingsSelectorQuery_movie {
  __typename: "Movie";
  showings: ShowingsSelectorQuery_movie_showings[];
}

export interface ShowingsSelectorQuery {
  movie: ShowingsSelectorQuery_movie | null;
}

export interface ShowingsSelectorQueryVariables {
  movieId: any;
  city: string;
}
