import gql from "graphql-tag";

export const showingFragment = gql`
  fragment ShowingNeue on Showing {
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
    participants {
      user {
        id
        avatar
      }
    }
  }
`;
