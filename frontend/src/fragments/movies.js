import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../store/apollo";
import { movieFragment } from "../Movie";

export const fetchMovies = graphql(
  gql`
    mutation FetchMovies {
      fetchNewMoviesFromSf {
        ...Movie
        id
        popularity
        releaseDate
      }
    }
    ${movieFragment}
  `,
  {
    props: ({ mutate }) => ({
      fetchMovies: () => wrapMutate(mutate)
    })
  }
);
