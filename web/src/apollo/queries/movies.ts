import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { movieFragment } from "../../use-cases/common/showing/Movie";
import { FetchMovies } from "./__generated__/FetchMovies";

export const useFetchMovies = () =>
  useMutation<FetchMovies>(
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
