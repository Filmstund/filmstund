import { gql } from "@apollo/client";
import { movieFragment } from "../common/showing/Showing";

export const createShowingFormQuery = gql`
  query CreateShowingQuery($movieId: UUID!) {
    movie(id: $movieId) {
      ...ShowingMovie
      releaseDate
    }
    me: currentUser {
      id
      nick
      name
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
