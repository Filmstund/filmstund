import gql from "graphql-tag";

export const fetchSfShowings = gql`
  query SfShowings($movieId: UUID!, $city: String!) {
    movie(id: $movieId) {
      sfShowings(city: $city) {
        cinemaName
        screen {
          sfId
          name
        }
        timeUtc
        tags
      }
    }
  }
`;
