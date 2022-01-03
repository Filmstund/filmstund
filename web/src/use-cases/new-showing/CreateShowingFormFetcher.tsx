import { gql } from "@apollo/client";
import { movieFragment } from "../common/showing/Showing";

export const createShowingFormQuery = gql`
  query CreateShowingQuery($movieId: UUID!) {
    movie(id: $movieId) {
      ...ShowingMovie
      releaseDate
    }
    previousLocations {
      name
    }
    filmstadenCities {
      name
      alias
    }
  }
  ${movieFragment}
`;
