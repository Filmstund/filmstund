import { gql } from "@apollo/client";

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
