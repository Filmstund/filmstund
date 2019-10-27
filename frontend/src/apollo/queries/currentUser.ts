import gql from "graphql-tag";

export const completeUserFragment = gql`
  fragment CompleteUser on UserDTO {
    id
    name
    firstName
    lastName
    nick
    email
    filmstadenMembershipId
    phone
    avatar
    giftCertificates {
      number
      expiresAt
      status
    }
  }
`;
