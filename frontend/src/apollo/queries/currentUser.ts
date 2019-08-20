import gql from "graphql-tag";

export const completeUserFragment = gql`
  fragment CompleteUser on CurrentUser {
    id
    name
    firstName
    lastName
    nick
    email
    filmstadenMembershipId
    phone
    avatar
    foretagsbiljetter {
      number
      expires
      status
    }
  }
`;
