/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SfShowings
// ====================================================

export interface SfShowings_movie_sfShowings_screen {
  __typename: "SfScreen";
  sfId: string;
  name: string;
}

export interface SfShowings_movie_sfShowings {
  __typename: "SfShowing";
  cinemaName: string | null;
  screen: SfShowings_movie_sfShowings_screen | null;
  timeUtc: string | null;
  tags: string[];
}

export interface SfShowings_movie {
  __typename: "Movie";
  sfShowings: SfShowings_movie_sfShowings[];
}

export interface SfShowings {
  movie: SfShowings_movie | null;
}

export interface SfShowingsVariables {
  movieId: any;
  city: string;
}
