import gql from "graphql-tag";
import { useQuery } from "urql";
import { MeQuery } from "./__generated__/MeQuery";

export const meQuery = gql`
  query MeQuery {
    currentUser {
      id
      avatar
      email
      firstName
      lastName
      nick
      phone
      filmstadenMembershipId
      calendarFeedUrl
      foretagsbiljetter {
        expires
        number
        status
      }
    }
  }
`;
export const useMeQuery = () =>
  useQuery<MeQuery>({
    query: meQuery
  });
