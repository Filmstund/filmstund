import { gql } from "@apollo/client";
import { movieFragment } from "../common/showing/Showing";

export const createShowingFormQuery = gql`
  query CreateShowingQuery($movieID: UUID!) {
    movie(id: $movieID) {
      ...ShowingMovie
      releaseDate
    }
    me: currentUser {
      id
      nick
      name
    }
    previouslyUsedLocations
    filmstadenCities {
      name
      alias
    }
  }
  ${movieFragment}
`;
