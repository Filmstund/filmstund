import gql from "graphql-tag";

export const completeUserFragment = gql`
  fragment CompleteUser on CurrentUser {
    id
    name
    firstName
    lastName
    nick
    email
    sfMembershipId
    phone
    avatar
    foretagsbiljetter {
      number
      expires
      status
    }
  }
`;
