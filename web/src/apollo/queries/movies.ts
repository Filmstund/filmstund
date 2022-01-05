import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { movieFragment } from "../../use-cases/common/showing/Movie";
import { FetchMoviesMutation } from "../../__generated__/types";

export const useFetchMovies = () =>
  useMutation<FetchMoviesMutation>(
    gql`
      mutation FetchMovies {
        fetchNewMoviesFromFilmstaden {
          ...Movie
          id
          popularity
          releaseDate
        }
      }
      ${movieFragment}
    `,
    {
      refetchQueries: ["NewShowingQuery"],
    }
  );
