import gql from "graphql-tag";
import { useMutation } from "react-apollo";
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
      refetchQueries: ["NewShowingQuery"]
    }
  );
