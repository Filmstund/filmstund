import gql from "graphql-tag";
import { useQuery } from "urql";
import { ShowingsByMovieQuery } from "./__generated__/ShowingsByMovieQuery";
import { showingScreenShowing } from "./ShowingScreen";

export const useShowingsByMovieQuery = () =>
  useQuery<ShowingsByMovieQuery>({
    query: gql`
      query ShowingsByMovieQuery {
        me: currentUser {
          id
        }
        publicShowings {
          ...ShowingScreenShowing
          movie {
            ...MovieListMovie
          }
        }
      }

      fragment MovieListMovie on Movie {
        id
        poster
        title
        releaseDate
        runtime
        imdbId
      }

      ${showingScreenShowing}
    `
  });
