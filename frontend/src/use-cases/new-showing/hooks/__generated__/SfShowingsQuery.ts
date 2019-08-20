/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SfShowingsQuery
// ====================================================

export interface SfShowingsQuery_movie_sfShowings_screen {
  __typename: "SfScreen";
  sfId: string;
  name: string;
}

export interface SfShowingsQuery_movie_sfShowings {
  __typename: "SfShowing";
  cinemaName: string | null;
  screen: SfShowingsQuery_movie_sfShowings_screen | null;
  timeUtc: string | null;
  tags: string[];
}

export interface SfShowingsQuery_movie {
  __typename: "Movie";
  sfShowings: SfShowingsQuery_movie_sfShowings[];
}

export interface SfShowingsQuery {
  movie: SfShowingsQuery_movie | null;
}

export interface SfShowingsQueryVariables {
  movieId: any;
  city?: string | null;
}
