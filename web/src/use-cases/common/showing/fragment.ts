import { gql } from "@apollo/client";

export const showingFragment = gql`
  fragment ShowingNeue on Showing {
    id
    date
    time
    webID
    slug
    movie {
      id
      poster
      title
    }
    myTickets {
      id
    }
    attendees {
      userInfo {
        id
        avatar
      }
    }
  }
`;
