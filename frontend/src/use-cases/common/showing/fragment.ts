import gql from "graphql-tag";

export const showingFragment = gql`
  fragment ShowingNeue on ShowingDTO {
    id
    date
    time
    webId
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
