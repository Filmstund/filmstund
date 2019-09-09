import gql from "graphql-tag";
import { useQuery } from "urql";
import { ShowingsByMovieQuery } from "./__generated__/ShowingsByMovieQuery";

export const useShowingsByMovieQuery = () =>
  useQuery<ShowingsByMovieQuery>({
    query: gql`
      query ShowingsByMovieQuery {
        me: currentUser {
          id
        }
        publicShowings {
          id
          date
          time
          myTickets {
            id
          }
          participants {
            user {
              id
              avatar
              firstName
              lastName
              nick
            }
          }
          location {
            name
          }
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
    `
  });
