import { gql } from "@apollo/client";

export const completeUserFragment = gql`
  fragment CompleteUser on User {
    id
    name
    firstName
    lastName
    nick
    email
    filmstadenMembershipID
    phone
    avatarURL
  }
`;
